import 'dotenv/config'
import LocalPrinter from './LocalPrinter.js'

const printer = new LocalPrinter()
printer.start()