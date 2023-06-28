import React, { useEffect, useState } from 'react'
import { WebViewMessage, eventBus } from '../../utils'
const useCoin = (type: string) => {
  const [coin, setCoin] = useState<any>([])
  useEffect(() => {
    eventBus.on(type, (data) => {
      setCoin(data)
    })

    eventBus.emitVscode(WebViewMessage.readVscodeConfig, type)

    return () => eventBus.off(type)
  }, [coin])
  return coin
}

export default useCoin
