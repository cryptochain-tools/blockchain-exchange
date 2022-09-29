if(window.acquireVsCodeApi){
  window.vscode = acquireVsCodeApi()
}

/**
 * Mitt: Tiny (~200b) functional event emitter / pubsub.
 * @name mitt
 * @returns {Mitt}
 */
function mitt(){
  const all = new Map()
  const untreated = new Map()

  return {
    /**
     * A Map of event names to registered handler functions.
     */
    all,

    /**
     * A Map of event names to record not resolved events.
     */
    untreated,

    /**
     * Register an event handler for the given type.
     * @param {string|symbol} type Type of event to listen for, or `'*'` for all events
     * @param {Function} handler Function to call in response to given event
     * @memberOf mitt
     */
    on(type, handler) {
      const handlers = all.get(type)
      if (handlers) {
        handlers.push(handler)
      } else {
        all.set(type, [handler])
      }

      /** 处理之前发送未能响应的消息 */
      const params = untreated.get(type)
      if (params !== undefined) {
        this.emit(type, params)
        untreated.delete(type)
      }
    },

    /**
     * Remove an event handler for the given type.
     * If `handler` is omitted, all handlers of the given type are removed.
     * @param {string|symbol} type Type of event to unregister `handler` from, or `'*'`
     * @param {Function} [handler] Handler function to remove
     * @memberOf mitt
     */
    off(type, handler) {
      const handlers = all.get(type)
      if (handlers) {
        if (handler) {
          handlers.splice(handlers.indexOf(handler) >>> 0, 1)
        } else {
          all.set(type, [])
        }
      }
    },

    /**
     * Invoke all handlers for the given type.
     * If present, `'*'` handlers are invoked after type-matched handlers.
     *
     * Note: Manually firing '*' handlers is not supported.
     *
     * @param {string|symbol} type The event type to invoke
     * @param {Any} [evt] Any value (object is recommended and powerful), passed to each handler
     * @memberOf mitt
     */
    emit(type, evt) {
      let handlers = all.get(type)
      if (handlers) {
        ;(handlers)
          .slice()
          .map((handler) => {
            handler(evt)
          })
      } else {
        // 如果接收消息的事件还没注册好需要先存下来
        untreated.set(type, evt)
      }

      handlers = all.get('*')
      if (handlers) {
        ;(handlers)
          .slice()
          .map((handler) => {
            handler(type, evt)
          })
      }
    },
    emitVscode(type, evt){
      if(window.vscode){
        window.vscode.postMessage({command: type, data:evt})
      }else {
        console.error('请在vscode环境运行')
      }
      
    }
  }
}


export default mitt()
