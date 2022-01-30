import { EventEmitter } from 'events'
import fs from 'fs'
import pIteration from 'p-iteration'
import Issue from './Issue.js'
import Storage from './Storage.js'
import { Blocks, HttpClient } from './core/index.js'
const { forEach } = pIteration

const storage = new Storage('db.json')

export default class IssueGenerator extends EventEmitter {
  constructor() {
    super()
    this.issue = null
    this.plugins = []
  }

  addPlugin(plugin, opts = { priority: 1 }) {
    this.plugins.push([plugin, opts])
  }

  async initialize() {
    if (!storage.initialized) {
      await storage.initialize()
    }

    this.plugins.forEach(([plugin]) => {
      const { name } = plugin.constructor
      storage.registerPlugin(plugin)
      console.log(`[IssueGenerator] Added plugin ${name}`)

      // Plugins can also have realtime events
      if (plugin.REALTIME) {
        console.log(`[IssueGenerator] ${name} has real-time support`)
        plugin.setup()
        plugin.on('update', msg => this.createRealtimeIssue(plugin, msg))
      }
    })
  }

  async update() {
    // Fetch the latest data from each of the plugins
    await forEach(this.plugins, ([plugin]) => this._updatePlugin(plugin))
  }

  async _updatePlugin(plugin) {
    try {
      // Realtime plugins don't have a fetch function
      if (!plugin.REALTIME) {
        await plugin.fetch(this.issue)
      }
    } catch (err) {
      console.log(`[IssueGenerator.${plugin._idPrefix}] Failed to fetch data`)
      console.log(err)
    }
  }

  // Create a mini issue just to print out the message block
  async createRealtimeIssue(plugin) {
    console.log(`[IssueGenerator] Printing event-driven issue from ${plugin.constructor.name}`)

    // Create the issue
    this.issue = new Issue({ realtime: true, updateOnly: true })

    const inIssue = [plugin]
    const blocks = this._createBlocks(inIssue)
    
    this.issue.addBlocks(...blocks)
    
    await this.renderToFile()
    await this.cleanUp(inIssue)
  }

  async createUpdateIssue() {
    console.log(`[IssueGenerator] Creating update issue`)
    // We also need to set some issue metadata like date & time, issue number
    // This should be stored in KV and updated
    const issueNo = 23
    const issuedAt = new Date()

    // Create the issue
    this.issue = new Issue({ issueNo, issuedAt, updateOnly: true })

    await this.update()

    const inIssue = this.plugins.filter(([plugin]) => plugin.hasFreshContent)
    if (inIssue.length === 0) {
      console.log(`[IssueGenerator] No plugins have fresh content, exiting`)
      return
    }

    const blocks = this._createBlocks(inIssue)
    this.issue.addBlocks(...blocks)
    await this.renderToFile()
    await this.cleanUp(inIssue)
  }

  async createIssue() {
    console.log(`[IssueGenerator] Creating issue`)

    // We also need to set some issue metadata like date & time, issue number
    // This should be stored in KV and updated
    const issueNo = 23
    const issuedAt = new Date()

    // Create the issue
    this.issue = new Issue({ issueNo, issuedAt })

    await this.update()

    const inIssue = this.plugins.filter(([plugin]) => plugin.hasContent)
    if (inIssue.length === 0) {
      console.log(`[IssueGenerator] No plugins have content, exiting`)
      return
    }

    const blocks = this._createBlocks(inIssue)
    this.issue.addBlocks(...blocks)
    await this.renderToFile()
    await this.cleanUp(inIssue)
  }

  async renderToFile() {
    const TEMP_FILE = 'output/issue.png'
    const file = fs.createWriteStream(TEMP_FILE)
    const data = await this.issue.render()
    
    // Wait for file to be written
    await new Promise(r => {
      data.pipe(file)
      file.on('finish', () => r())
    })

    console.log(`[IssueGenerator] Export complete`)
    this.emit('print')
  }

  _createBlocks(plugins) {
    let blocks = []

    if (!this.issue.realtime) {
      blocks = [
        new Blocks.Header(),
        new Blocks.Spacer(40),
      ]
    }

    // Loop through the data plugins with fresh content and add required blocks
    for (let i = 0; i < plugins.length; i++) {
      const [plugin] = plugins[i]
      const startLen = blocks.length

      blocks = [
        ...blocks,
        ...plugin.render(),
        new Blocks.Spacer(40)
      ]

      const newBlocks = blocks.slice(-blocks.length - startLen).map(block => block.constructor.name)
      console.log(`[IssueGenerator.${plugin._idPrefix}] Added ${newBlocks.join(', ')}`)
    }

    blocks = [
      ...blocks,
      new Blocks.Footer(),
      new Blocks.Spacer(150),
    ]

    return blocks
  }

  // Mark data used as required
  async cleanUp(plugins) {
    // Clean up data from external providers
    await forEach(plugins, ([plugin]) => provider.cleanUp())
    // Save state
    await storage.write()
  }
}