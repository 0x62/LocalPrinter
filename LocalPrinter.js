import cron from 'node-cron'
import Printer from 'thermalprinter'
import IssueGenerator from './IssueGenerator.js'

// https://github.com/xseignard/thermalPrinter

export default class LocalPrinter {
  constructor({ deleteAfterPrint, issueTitle, schedule, button }) {
    this.printer = null
    this.config = {
      deleteAfterPrint,
      issueTitle,
      schedule,
      button
    }

    this.generator = new IssueGenerator()
    this.generator.on('print', () => this._print())
  }

  connect(serialPort) {
    console.log('[LocalPrinter] Waiting for serial port to be ready...')
    this.serialPort = serialPort
    this.serialPort.on('open', () => this.start())
    this.serialPort.on('error', err => console.log(err))
  }

  addPlugin(plugin, opts) {
    plugin.registerPrinter(this)
    this.generator.addPlugin(plugin, opts)
  }

  async start() {
    console.log('[LocalPrinter] Starting...')
    
    if (this.serialPort) {
      this.printer = new Printer(this.serialPort)
      console.log('[LocalPrinter] Initialized serial printer')
    }

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

  async _createIssue() {
    console.log('[LocalPrinter] Creating issue')
    await this.generator.createIssue()
  }

  _print() {
    if (!this.printer) {
      console.log('this.printer = null')
      return
    }

    console.log('[LocalPrinter] Printing...')
    this.printer.printImage('./output/issue.png').print(() => {
      console.log('[LocalPrinter] Print completed')
    })
  }
}

