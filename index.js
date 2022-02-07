import 'dotenv/config'
import SerialPort from 'serialport'
import LocalPrinter from './LocalPrinter.js'
import {
  InstagramPlugin,
  OpenWeatherPlugin,
  QuotePlugin,
  SpotifyPlugin,
  TelegramPlugin,
  NewsPlugin } from './plugins/index.js'

// Ceate a new LocalPrinter
const printer = new LocalPrinter({
  deleteAfterPrint: process.env.DELETE_AFTER_PRINT,
  issueTitle: {
    full: process.env.ISSUE_TITLE_FULL,
    update: process.env.ISSUE_TITLE_UPDATE,
    dateFmt: process.env.ISSUE_DATE_FMT,
  },
  // Set a schedule for automatically printing isssues
  schedule: [
    // You can as many schedule entries as you'd like
    { pattern: process.env.AUTO_ISSUE_SCHEDULE, issueType: process.env.AUTO_ISSUE_TYPE },
  ],
  button: {
    pin: process.env.BUTTON_GPIO_PIN,
    ledPin: process.env.BUTTON_LED_GPIO_PIN,
    issueType: process.env.BUTTON_ISSUE_TYPE,
  },
})

// News headlines
const { NEWSAPI_TOKEN, NEWS_CONDENSED_UPDATE } = process.env
if (NEWSAPI_TOKEN) {
  printer.addPlugin(
    new NewsPlugin(NEWSAPI_TOKEN, NEWS_CONDENSED_UPDATE === 'true'),
    { priority: 1 }
  )
}

// Telegram
// Monitor a Spotify playlist for changes, and include new songs in update issues
const { TELEGRAM_TOKEN, TG_ALLOWED_IDS, TG_IMMEDIATE } = process.env
if (TELEGRAM_TOKEN) {
  printer.addPlugin(
    new TelegramPlugin(TELEGRAM_TOKEN, TG_ALLOWED_IDS),
    { priority: 1, printImmediate: TG_IMMEDIATE }
  )
}

// OpenWeather
// In full issues this module will print the daily forcast and any weather alerts. In update issues,
// this module will only be included if the forecast includes adverse conditions (e.g rain, snow
// or hail)
const { OPENWEATHER_TOKEN, WEATHER_LAT_LON, WEATHER_UNITS, WEATHER_LANG } = process.env
if (OPENWEATHER_TOKEN && WEATHER_LAT_LON) {
  printer.addPlugin(
    new OpenWeatherPlugin(OPENWEATHER_TOKEN, WEATHER_LAT_LON, WEATHER_UNITS, WEATHER_LANG),
    { priority: 2 }
  )
}

// Spotify
// Monitor a Spotify playlist for changes, and include new songs in update issues
const { SPOTIFY_CLIENT_ID, SPOTIFY_SECRET, SPOTIFY_PLAYLIST } = process.env
if (SPOTIFY_CLIENT_ID && SPOTIFY_SECRET && SPOTIFY_PLAYLIST) {
  printer.addPlugin(
    new SpotifyPlugin(SPOTIFY_CLIENT_ID, SPOTIFY_SECRET, SPOTIFY_PLAYLIST),
    { priority: 2 }
  )
}


// Register some plugins (see plugins directory for examples
// Instagram
// Prints out your latest post the following morning
const { INSTAGAM_USER } = process.env
if (INSTAGAM_USER) {
  printer.addPlugin(
    new InstagramPlugin(INSTAGAM_USER),
    { priority: 3 }
  )
}


// Quotes
// Print a daily motivation (or demotivational!) quote from a CSV database. This module could do with
// some TLC (probably should be connected to an API instead?).
const { QUOTES_ENABLED, QUOTE_IS_UPDATE } = process.env
if (QUOTES_ENABLED) {
  printer.addPlugin(
    new QuotePlugin(),
    { priority: 3, printAlways: QUOTE_IS_UPDATE === 'true' }
  )
}

// Start the printer
const run = async () => {
  if (process.env.DEV_MODE !== 'true') {
    // Connect to the serial port if not in dev mode
    const port = new SerialPort(process.env.SERIAL_PORT, { baudRate: 19200 })
    await printer.connect(port)
  }

  await printer.start()

  // In dev mode create an issue immediately
  // if (process.env.DEV_MODE) {
    await printer.createIssue('full')
  // }
}

run()

