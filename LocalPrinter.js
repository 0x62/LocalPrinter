import cron from 'node-cron'
import Printer from 'thermalprinter'
import IssueGenerator from './IssueGenerator.js'

// https://github.com/xseignard/thermalPrinter

export default class LocalPrinter {
  constructor({ deleteAfterPrint, issueTitle, schedule = [], button }) {
    this.printer = null
    this.config = {
      deleteAfterPrint,
      issueTitle,
      schedule,
      button
    }

    this.generator = new IssueGenerator(this.config)
    this.generator.on('print', (filename) => this._print(filename))

    this.setSchedule(schedule)
  }

  async connect(serialPort) {
    return new Promise((r, j) => {
      console.log('[LocalPrinter] Waiting for serial port to be ready...')
      this.serialPort = serialPort
      this.serialPort.on('open', () => {
        console.log('[LocalPrinter] Serial port is ready')
        this.printer = new Printer(this.serialPort)
        r()
      })
      this.serialPort.on('error', err => {
        console.log('')
      })
    })
  }

  addPlugin(plugin, opts) {
    plugin.registerPrinter(this)
    this.generator.addPlugin(plugin, opts)
  }

  clearSchedule() {
    this.config.schedule
      .filter(({ task }) => !!task)
      .forEach(item => item.task.destroy())
  }

  setSchedule(issues) {
    this.clearSchedule()
    this.config.schedule = issues.map(({ pattern, issueType }) => {
      const task = cron.schedule(pattern, () => this.createIssue(issueType))
      return { pattern, issueType, task }
    })
  }

  async start() {
    console.log('[LocalPrinter] Starting...')

    await this.generator.initialize()

    console.log('[LocalPrinter] Running')
    console.log(this.config.schedule.map(({ pattern, issueType }) => `  - ${issueType} issue at ${pattern}`).join('\n'))
  }

  async createIssue(type = 'full') {
    if (type === 'full') {
      await this.generator.createIssue()
    } else if (type === 'update') {
      await this.generator.createUpdateIssue()
    }
  }

  // Handle GPIO for main button pushed, should create a full issue
  async buttonPushed() {
    await this.createIssue('full')
  }

  _actuallyPrint(filename) {
    return new Promise((r, j) => {
      if (!this.printer) {
        console.log(`[LocalPrinter] Printer not connected, written to file: ${filename}`)
        return r()
      }

      console.log('[LocalPrinter] Printing...')
      this.printer.printImage(filename).print(r)
    })
  }

  // Emitted by generator once file is ready
  async _print(filename) {
    await this._actuallyPrint(filename)
    console.log('[LocalPrinter] Print completed')
    // Do any more cleanup
  }
}

