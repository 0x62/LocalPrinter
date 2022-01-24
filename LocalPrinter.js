import cron from 'node-cron'
import Printer from 'thermalprinter'
import IssueGenerator from './IssueGenerator.js'

// https://github.com/xseignard/thermalPrinter

export default class LocalPrinter {
  constructor(serialPort) {
    this.generator = new IssueGenerator()
    this.printer = null
    this.serialPort = serialPort

    console.log('[LocalPrinter] Waiting for serial port to be ready...')
    this.serialPort.on('ready', this.start.bind(this))
  }

  async start() {
    console.log('[LocalPrinter] Starting...')
    await this.generator.initialize()

    this.printer = new Printer(this.serialPort)

    // Create an update issue every day at 7am
    cron.schedule('0 7 * * *', this._createUpdateIssue.bind(this))
    console.log('[LocalPrinter] Running, next issue will be generated at 7:00am')

    this._createIssue()
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