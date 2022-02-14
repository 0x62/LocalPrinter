import cron from 'node-cron'
import Printer from 'thermalprinter'
import { Gpio } from 'onoff'
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

    if (button.pin) {
      const btn = new Gpio(button.pin, 'in', 'both')
      btn.watch((err, value) => this.createIssue(button.issueType));

      if (button.ledPin) {
        this.led = new Gpio(button.ledPin, 'out')
        const iv = setInterval(_ => this.led.writeSync(this.led.readSync() ^ 1), 500);
      }
    }
  }

  _flashLed(speed = 300) {
    if (!this.led) return
    this.ledIv = setInterval(_ => this.led.writeSync(this.led.readSync() ^ 1), speed);
  }

  _unflashLed() {
    if (!this.ledIv) return
    clearInterval(this.ledIv)
    this.ledIv = null
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
        console.log(`[LocalPrinter] Serial port error: ${err.message}`)
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
    this._flashLed(200)
    console.log('[LocalPrinter] Starting...')

    await this.generator.initialize()

    console.log('[LocalPrinter] Running')
    console.log(this.config.schedule.map(({ pattern, issueType }) => `  - ${issueType} issue at ${pattern}`).join('\n'))
    this._unflashLed()
  }

  async createIssue(type = 'full') {
    this._flashLed(500)
    if (type === 'full') {
      await this.generator.createIssue()
    } else if (type === 'update') {
      await this.generator.createUpdateIssue()
    }
    this._unflashLed()
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

      console.log(`[LocalPrinter] Printing ${filename}`)
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

