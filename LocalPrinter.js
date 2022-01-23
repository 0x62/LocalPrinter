import cron from 'node-cron'
import IssueGenerator from './IssueGenerator.js'

// https://github.com/xseignard/thermalPrinter

export default class LocalPrinter {
  constructor() {
    this.generator = new IssueGenerator()
  }

  async start() {
    console.log('[LocalPrinter] Starting...')
    await this.generator.initialize()

    // Create an update issue every day at 7am
    cron.schedule('0 7 * * *', this._createUpdateIssue.bind(this))
    console.log('[LocalPrinter] Running, next issue will be generated at 7:00am')
  }

  // Handle GPIO for main button pushed, should create a full issue
  async buttonPushed() {
    await this._createIssue()
  }

  async _createUpdateIssue() {
    console.log('[LocalPrinter] Creating update issue')
    await this.generator.createUpdateIssue()
  }

  _createIssue() {
    console.log('[LocalPrinter] Creating issue')
    return this.generator.createIssue()
  }
}