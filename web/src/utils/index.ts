import eventBus from './eventBus'
import { WebViewMessage } from '../../../src/config/constants'

const formatPercentage = (num: any, x = 1, fixed = 2) => {
  if (num) {
    const _num = Number(Number(Number(num) * x)).toFixed(fixed)
    return Number(_num)
  } else {
    return 0
  }
}

export { eventBus, WebViewMessage, formatPercentage }
