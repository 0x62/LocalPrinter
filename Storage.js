import { join, dirname } from 'path'
import { Low, JSONFile } from 'lowdb'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url));

export default class Storage {
  constructor(filename) {
    const path = join(__dirname, 'db.json')
    const adapter = new JSONFile(path)
    
    // Set initial state
    this.db = new Low(adapter)
  }

  get initialized() {
    return !!this.db.data
  }

  async initialize() {
    await this.db.read()
    this.db.data ||= {
      hasRunOnce: false,
      nextIssueNo: 1,
    }

    console.log(`[Storage] Initialized`)
  }

  async write() {
    return this.db.write()
  }

  registerProvider(provider) {
    const name = provider.constructor.name
    // this.db.data[`${name}.seenIds`] ||= []
    this.db.data[name] ||= {
      seenIds: []
    }
    provider.registerStorage(this)
    console.log(`[Storage] Registered provider ${name}`)
  }

  // setInitialIds(provider, ids = []) {
  //   this.db.data[`${provider}.seenIds`] = ids
  // }

  unseenIds(provider, ids = []) {
    return ids.filter(id => {
      console.log(`[Storage.${provider}] Checking if ${id} has been seen`)
      return this.db.data[provider].seenIds.includes(id) === false
    })
  }

  addSeenIds(provider, ids = []) {
    // Prevent having duplicates saved
    const unseen = this.unseenIds(provider, ids)

    this.db.data[provider].seenIds ||= []
    this.db.data[provider].seenIds = [
      ...this.db.data[provider].seenIds,
      ...unseen
    ]
  }
}