import { EventEmitter } from 'events'
import pIteration from 'p-iteration'
import HttpClient from './HttpClient.js'

const { forEach } = pIteration

export default class Provider extends EventEmitter {
  constructor(httpConfig) {
    super()

    if (httpConfig) {
      this.http = new HttpClient(httpConfig)
    }

    this._idPrefix = this.constructor.name
    this._onCleanUp = []
    this.data = {}
  }

  registerStorage(storage) {
    this.storage = storage
  }

  // Pass an array of items plus a function to pick ids, returns filtered array of unseen items
  filterSeenItems(items, pickerFn) {
    const ids = items.map(pickerFn)
    const unseenIds = this.storage.unseenIds(this._idPrefix, ids)
    return unseenIds.map(id => items[ids.indexOf(id)])
  }

  // After issue is successfully generated mark these ids as seen
  markSeenOnCleanUp(items, pickerFn) {
    const ids = items.map(pickerFn)
    this.onCleanUp(async () => {
      return this.storage.addSeenIds(this._idPrefix, ids)
    })
  }

  // Check if Id has been seen
  isIdSeen(id) {
    return this.storage.unseenIds(this._idPrefix, [id]).length === 0
  }

  onCleanUp(fn) {
    this._onCleanUp.unshift(fn)
  }

  async cleanUp() {
    await forEach(this._onCleanUp, async (fn) => {
      try {
        await fn()
      } catch (err) {
        console.log(`[${this._idPrefix}] Error running cleanup: ${err.message}`)
        console.log(err)
      }
    })

    this._onCleanUp = []
  }
}