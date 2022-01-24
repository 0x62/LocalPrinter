import cron from 'node-cron'
import Printer from 'thermalprinter'
import IssueGenerator from './IssueGenerator.js'

// https://github.com/xseignard/thermalPrinter

export default class LocalPrinter {
  constructor(serialPort) {
    this.generator = new IssueGenerator()
    this.printer = null
    this.serialPort = serialPort


    if (serialPort) {
      console.log('[LocalPrinter] Waiting for serial port to be ready...')
      this.serialPort.on('open', this.start.bind(this))
      this.serialPort.on('error', err => console.log(err))
    } else {
      console.log('[LocalPrinter] Serial port not provided, running in dev mode')
      this.start()
    }

    this.generator.on('print', this._print.bind(this))
  }

  async start() {
    console.log('[LocalPrinter] Starting...')
    await this.generator.initialize()

    if (this.serialPort) {
      this.printer = new Printer(this.serialPort)
    }

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

  async _createIssue() {
    console.log('[LocalPrinter] Creating issue')
    await this.generator.createIssue()
  }

  _print() {
    if (!this.printer) return
    console.log('[LocalPrinter] Printing...')
    this.printer.printImage('./output/issue.png').print(() => {
      console.log('[LocalPrinter] Print completed')
    })
  }
}