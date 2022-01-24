import 'dotenv/config'
import SerialPort from 'serialport'
import LocalPrinter from './LocalPrinter.js'

const port = new SerialPort('/dev/tty0', {
  baudRate: 19200
})

const printer = new LocalPrinter(port)