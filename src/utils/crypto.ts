import { enc, AES, mode, pad, DES } from 'crypto-js'

const iv = enc.Utf8.parse('ABCDEF1234123412') //十六位十六进制数作为密钥偏移量

//加密方法
export function Encrypt(word, k) {
  const key = enc.Utf8.parse(k) //十六位十六进制数作为密钥
  let srcs = enc.Utf8.parse(word)
  let encrypted = AES.encrypt(srcs, key, {
    iv: iv,
    mode: mode.CBC,
    padding: pad.Pkcs7,
  })
  return encrypted.ciphertext.toString().toUpperCase()
}

//解密方法
export function Decrypt(word, k) {
  const key = enc.Utf8.parse(k) //十六位十六进制数作为密钥
  let encryptedHexStr = enc.Hex.parse(word)
  let srcs = enc.Base64.stringify(encryptedHexStr)
  let decrypt = AES.decrypt(srcs, key, {
    iv: iv,
    mode: mode.CBC,
    padding: pad.Pkcs7,
  })
  let decryptedStr = decrypt.toString(enc.Utf8)
  return decryptedStr.toString()
}

const desKey = enc.Utf8.parse('11')

//DES加密方法
export function desEncrypt(message) {
  let encrypted = DES.encrypt(message, desKey, {
    mode: mode.ECB,
    padding: pad.Pkcs7,
  })
  return encrypted.toString()
}
//DES解密方法
export function desDecrypt(ciphertext) {
  if (ciphertext === '' || ciphertext === null || ciphertext === undefined) {
    return ''
  }
  if (typeof ciphertext !== 'string') {
    ciphertext = ciphertext.toString()
  }
  var decrypted = DES.decrypt(
    {
      ciphertext: enc.Base64.parse(ciphertext),
    },
    desKey,
    {
      mode: mode.ECB,
      padding: pad.Pkcs7,
    }
  )
  return decrypted.toString(enc.Utf8)
}
