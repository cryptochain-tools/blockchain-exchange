import path from 'path'
import childProcess from 'child_process'
import { promises as fs, constants as fsConstants } from 'fs'
import isWsl from 'is-wsl'
import isDocker from 'is-docker'
import defineLazyProperty from 'define-lazy-prop'

import { ChildProcess } from 'child_process'

interface Options {
  /**
    Wait for the opened app to exit before fulfilling the promise. If `false` it's fulfilled immediately when opening the app.

    Note that it waits for the app to exit, not just for the window to close.

    On Windows, you have to explicitly specify an app for it to be able to wait.

    @default false
    */
  readonly wait?: boolean

  /**
    __macOS only__

    Do not bring the app to the foreground.

    @default false
    */
  readonly background?: boolean

  /**
    __macOS only__

    Open a new instance of the app even it's already running.

    A new instance is always opened on other platforms.

    @default false
    */
  readonly newInstance?: boolean

  /**
    Specify the `name` of the app to open the `target` with, and optionally, app `arguments`. `app` can be an array of apps to try to open and `name` can be an array of app names to try. If each app fails, the last error will be thrown.

    The app name is platform dependent. Don't hard code it in reusable modules. For example, Chrome is `google chrome` on macOS, `google-chrome` on Linux and `chrome` on Windows. If possible, use [`open.apps`](#openapps) which auto-detects the correct binary to use.

    You may also pass in the app's full path. For example on WSL, this can be `/mnt/c/Program Files (x86)/Google/Chrome/Application/chrome.exe` for the Windows installation of Chrome.

    The app `arguments` are app dependent. Check the app's documentation for what arguments it accepts.
    */
  readonly app?: App | readonly App[]

  /**
    Allow the opened app to exit with nonzero exit code when the `wait` option is `true`.

    We do not recommend setting this option. The convention for success is exit code zero.

    @default false
    */
  readonly allowNonzeroExitCode?: boolean
}

interface OpenAppOptions extends Omit<Options, 'app'> {
  /**
    Arguments passed to the app.

    These arguments are app dependent. Check the app's documentation for what arguments it accepts.
    */
  readonly arguments?: readonly string[]
}

type AppName = 'chrome' | 'firefox' | 'edge'

type App = {
  name: string | readonly string[]
  arguments?: readonly string[]
}

// Path to included `xdg-open`.
const localXdgOpenPath = path.join(__dirname, 'xdg-open')

const { platform, arch } = process

/**
Get the mount point for fixed drives in WSL.

@inner
@returns {string} The mount point.
*/
const getWslDrivesMountPoint = (() => {
  // Default value for "root" param
  // according to https://docs.microsoft.com/en-us/windows/wsl/wsl-config
  const defaultMountPoint = '/mnt/'

  let mountPoint

  return async function () {
    if (mountPoint) {
      // Return memoized mount point value
      return mountPoint
    }

    const configFilePath = '/etc/wsl.conf'

    let isConfigFileExists = false
    try {
      await fs.access(configFilePath, fsConstants.F_OK)
      isConfigFileExists = true
    } catch {}

    if (!isConfigFileExists) {
      return defaultMountPoint
    }

    const configContent = await fs.readFile(configFilePath, {
      encoding: 'utf8',
    })
    const configMountPoint = /(?<!#.*)root\s*=\s*(?<mountPoint>.*)/g.exec(
      configContent
    )

    if (!configMountPoint) {
      return defaultMountPoint
    }

    mountPoint = configMountPoint.groups.mountPoint.trim()
    mountPoint = mountPoint.endsWith('/') ? mountPoint : `${mountPoint}/`

    return mountPoint
  }
})()

const pTryEach = async (array, mapper) => {
  let latestError

  for (const item of array) {
    try {
      return await mapper(item) // eslint-disable-line no-await-in-loop
    } catch (error) {
      latestError = error
    }
  }

  throw latestError
}

const baseOpen = async (options) => {
  options = {
    wait: false,
    background: false,
    newInstance: false,
    allowNonzeroExitCode: false,
    ...options,
  }

  if (Array.isArray(options.app)) {
    return pTryEach(options.app, (singleApp) =>
      baseOpen({
        ...options,
        app: singleApp,
      })
    )
  }

  let { name: app, arguments: appArguments = [] } = options.app || {}
  appArguments = [...appArguments]

  if (Array.isArray(app)) {
    return pTryEach(app, (appName) =>
      baseOpen({
        ...options,
        app: {
          name: appName,
          arguments: appArguments,
        },
      })
    )
  }

  let command
  const cliArguments = []
  const childProcessOptions: any = {}

  if (platform === 'darwin') {
    command = 'open'

    if (options.wait) {
      cliArguments.push('--wait-apps')
    }

    if (options.background) {
      cliArguments.push('--background')
    }

    if (options.newInstance) {
      cliArguments.push('--new')
    }

    if (app) {
      cliArguments.push('-a', app)
    }
  } else if (platform === 'win32' || (isWsl && !isDocker())) {
    const mountPoint = await getWslDrivesMountPoint()

    command = isWsl
      ? `${mountPoint}c/Windows/System32/WindowsPowerShell/v1.0/powershell.exe`
      : `${process.env.SYSTEMROOT}\\System32\\WindowsPowerShell\\v1.0\\powershell`

    cliArguments.push(
      '-NoProfile',
      '-NonInteractive',
      '–ExecutionPolicy',
      'Bypass',
      '-EncodedCommand'
    )

    if (!isWsl) {
      childProcessOptions.windowsVerbatimArguments = true
    }

    const encodedArguments = ['Start']

    if (options.wait) {
      encodedArguments.push('-Wait')
    }

    if (app) {
      // Double quote with double quotes to ensure the inner quotes are passed through.
      // Inner quotes are delimited for PowerShell interpretation with backticks.
      encodedArguments.push(`"\`"${app}\`""`, '-ArgumentList')
      if (options.target) {
        appArguments.unshift(options.target)
      }
    } else if (options.target) {
      encodedArguments.push(`"${options.target}"`)
    }

    if (appArguments.length > 0) {
      appArguments = appArguments.map((arg) => `"\`"${arg}\`""`)
      encodedArguments.push(appArguments.join(','))
    }

    // Using Base64-encoded command, accepted by PowerShell, to allow special characters.
    options.target = Buffer.from(
      encodedArguments.join(' '),
      'utf16le'
    ).toString('base64')
  } else {
    if (app) {
      command = app
    } else {
      // When bundled by Webpack, there's no actual package file path and no local `xdg-open`.
      const isBundled = !__dirname || __dirname === '/'

      // Check if local `xdg-open` exists and is executable.
      let exeLocalXdgOpen = false
      try {
        await fs.access(localXdgOpenPath, fsConstants.X_OK)
        exeLocalXdgOpen = true
      } catch {}

      const useSystemXdgOpen =
        process.versions.electron ||
        platform === 'android' ||
        isBundled ||
        !exeLocalXdgOpen
      command = useSystemXdgOpen ? 'xdg-open' : localXdgOpenPath
    }

    if (appArguments.length > 0) {
      cliArguments.push(...appArguments)
    }

    if (!options.wait) {
      // `xdg-open` will block the process unless stdio is ignored
      // and it's detached from the parent even if it's unref'd.
      childProcessOptions.stdio = 'ignore'
      childProcessOptions.detached = true
    }
  }

  if (options.target) {
    cliArguments.push(options.target)
  }

  if (platform === 'darwin' && appArguments.length > 0) {
    cliArguments.push('--args', ...appArguments)
  }

  const subprocess = childProcess.spawn(
    command,
    cliArguments,
    childProcessOptions
  )

  if (options.wait) {
    return new Promise((resolve, reject) => {
      subprocess.once('error', reject)

      subprocess.once('close', (exitCode) => {
        if (options.allowNonzeroExitCode && exitCode > 0) {
          reject(new Error(`Exited with code ${exitCode}`))
          return
        }

        resolve(subprocess)
      })
    })
  }

  subprocess.unref()

  return subprocess
}

const open = (target, options?: Options) => {
  if (typeof target !== 'string') {
    throw new TypeError('Expected a `target`')
  }

  return baseOpen({
    ...options,
    target,
  })
}

const openApp = (name, options) => {
  if (typeof name !== 'string') {
    throw new TypeError('Expected a `name`')
  }

  const { arguments: appArguments = [] } = options || {}
  if (
    appArguments !== undefined &&
    appArguments !== null &&
    !Array.isArray(appArguments)
  ) {
    throw new TypeError('Expected `appArguments` as Array type')
  }

  return baseOpen({
    ...options,
    app: {
      name,
      arguments: appArguments,
    },
  })
}

function detectArchBinary(binary) {
  if (typeof binary === 'string' || Array.isArray(binary)) {
    return binary
  }

  const { [arch]: archBinary } = binary

  if (!archBinary) {
    throw new Error(`${arch} is not supported`)
  }

  return archBinary
}

function detectPlatformBinary({ [platform]: platformBinary }: any, { wsl }) {
  if (wsl && isWsl) {
    return detectArchBinary(wsl)
  }

  if (!platformBinary) {
    throw new Error(`${platform} is not supported`)
  }

  return detectArchBinary(platformBinary)
}

const apps = {}

defineLazyProperty(apps, 'chrome', () =>
  detectPlatformBinary(
    {
      darwin: 'google chrome',
      win32: 'chrome',
      linux: ['google-chrome', 'google-chrome-stable', 'chromium'],
    },
    {
      wsl: {
        ia32: '/mnt/c/Program Files (x86)/Google/Chrome/Application/chrome.exe',
        x64: [
          '/mnt/c/Program Files/Google/Chrome/Application/chrome.exe',
          '/mnt/c/Program Files (x86)/Google/Chrome/Application/chrome.exe',
        ],
      },
    }
  )
)

defineLazyProperty(apps, 'firefox', () =>
  detectPlatformBinary(
    {
      darwin: 'firefox',
      win32: 'C:\\Program Files\\Mozilla Firefox\\firefox.exe',
      linux: 'firefox',
    },
    {
      wsl: '/mnt/c/Program Files/Mozilla Firefox/firefox.exe',
    }
  )
)

defineLazyProperty(apps, 'edge', () =>
  detectPlatformBinary(
    {
      darwin: 'microsoft edge',
      win32: 'msedge',
      linux: ['microsoft-edge', 'microsoft-edge-dev'],
    },
    {
      wsl: '/mnt/c/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
    }
  )
)

open.apps = apps
open.openApp = openApp

export default open
