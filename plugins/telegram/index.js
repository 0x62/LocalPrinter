import TelegramBot from 'node-telegram-bot-api'
import canvas from 'canvas'
import fs from 'fs'
import pIteration from 'p-iteration'
const { createCanvas, registerFont } = canvas
const { forEachSeries } = pIteration
import { InlineKeyboard, ReplyKeyboard, ForceReply, Row, KeyboardButton, InlineKeyboardButton } from 'node-telegram-keyboard-wrapper'
import { Plugin, Blocks } from '../../core/index.js'
import Message from './blocks/Message.js'

/****
 * NEEDS CLEANING UP
 * The full issue/update issue concept doesn't work too great for telegram. Perhaps needs a new
 * system for realtime plugins?
 * */

const bot = new TelegramBot(process.env.TELEGRAM_TOKEN, { polling: true })
const ALLOWED_USERS = [1689019195]

bot.onText(/\/start/i, async msg => {
  if (!ALLOWED_USERS.includes(msg.from.id)) {
    bot.sendMessage(msg.chat.id, `You don't have permission yet. Let me know your ID is: ${msg.from.id}`)
    return
  }

  const keyboard = new InlineKeyboard()
  keyboard.push(
    new Row(
      new InlineKeyboardButton('💌 Postcard', 'callback_data', 'postcard'),
      new InlineKeyboardButton('🎶 Spotify link', 'callback_data', 'spotify'),
    )
  )
  bot.sendMessage(msg.from.id, 'Welcome to Xin Wen Mail, exclusivly serving Appartment 3 since 2022. Here are the things you can send:', {
    reply_markup: keyboard.getMarkup()
  })
})


bot.on('callback_query', async (query) => {
  switch (query.data) {
    case 'postcard':
      await bot.sendMessage(query.from.id, '💌 Send me a message and/or photo to print')
      break
    case 'spotify':
      await bot.sendMessage(query.from.id, '🎶 Paste a link to a Spotify album, song or podcast')
      break
  }
});

export default class TelegramPlugin extends Plugin {
  constructor() {
    super()
    this.REALTIME = true
    this.data = {
      newMessages: [],
      messages: [],
    }
  }

  get hasFreshContent() {
    const { newMessages } = this.data
    return newMessages && newMessages.length
  }

  get hasContent() {
    const { messages } = this.data
    return messages && messages.length
  }

  _notAllowed(msg) {
    if (!ALLOWED_USERS.includes(msg.from.id)) {
      bot.sendMessage(msg.chat.id, `You don't have permission yet. Let me know your ID is: ${msg.from.id}`)
      return true
    }
  }

  setup() {
    bot.on('message', async (msg) => {
      // Check the user is allowed to message
      if (this._notAllowed(msg)) return
      if (msg.text && msg.text.charAt(0) === '/') return

      if (msg.text) {
        // Plain text message
        this.data.newMessages.push({
          id: msg.message_id,
          chat: msg.chat.id,
          from: msg.from.first_name,
          date: new Date(msg.date * 1000),
          message: msg.text,
        })
      } else if (msg.photo) {
        // Photo message
        const photo = msg.photo.find(({ height }) => height <= 320 && height > 90)
        if (!photo) return

        const url = await bot.getFileLink(photo.file_id)

        this.data.newMessages.push({
          id: msg.message_id,
          chat: msg.chat.id,
          from: msg.from.first_name + ' ' + msg.from.last_name,
          date: new Date(msg.date * 1000),
          photo: url
        })
      } else {
        bot.sendMessage(msg.chat.id, 'You can only send text or photos')
        return
      }

      // Mark seen and Move messages to old messages after save
      this.onCleanUp(() => {
        this.storage.addSeenIds(this._idPrefix, [msg.message_id])
        this.data = {
          newMessages: [],
          messages: [
            ...this.data.messages,
            ...this.data.newMessages
          ]
        }
      })

      this.emit('update')
    })
  }

  render(issue) {
    let blocks = []
    const { messages, newMessages } = this.data

    const getBlock = msg => {
      if (msg.photo) {
        return new Blocks.Photo({ url: msg.photo })
      } else {
        return new Message(msg)
      }
    }

    if (issue.updateOnly) {
      // Show all unseen messages
      blocks = newMessages.map((message, idx) => {
        const toAdd = [getBlock(message)]

        // this.onCleanUp(() => {
        //   this._sendReply([getBlock(message)], message)
        // })

        if (idx < newMessages.length - 1) {
          toAdd.push(new Blocks.Spacer(15))
        }
        return toAdd
      }).flat()
    } else {
      blocks = [getBlock(messages[0])]
    }

    return blocks
  }

  // After it's been rendered we render again to a seperate file and send back to the sender so they
  // can see what it looked like printed
  async _sendReply(blocks, message) {
    console.log(`[Telegram] Creating reply for ${message.chat}`)
    const canvas = createCanvas(500, 5000)
    const ctx = canvas.getContext('2d')

    // Fill the canvas in white
    ctx.beginPath()
    ctx.rect(0, 0, canvas.width, canvas.height)
    ctx.fillStyle = "white"
    ctx.closePath()
    ctx.fill()

    const issue = { height: 0, canvas, ctx }

    await forEachSeries(blocks, async block => {
      block._setupCanvas(issue)
      try {
        const { endPosY } = await block.render()
        issue.height = endPosY
      } catch (err) {
        console.log(`[Telegram] Failed to render ${block.constructor.name}`)
        console.log(err)
      }
    })

    // To resize the canvas we create another canvas of the correct size and copy data
    const exporter = createCanvas(500, issue.height)
    const exportCtx = exporter.getContext('2d')
    exportCtx.drawImage(canvas, 0, 0, 500, issue.height, 0, 0, 500, issue.height)
    const data = exporter.createPNGStream()
    const filename = `./output/telegram-reply-${message.chat}.png`
    const output = fs.createWriteStream(filename)

    // Wait for file to be written
    await new Promise(r => { 
      data.pipe(output)
      output.on('finish', () => r())
    })

    bot.sendMessage(message.chat, '🖨 Your message was delivered!')
    bot.sendPhoto(message.chat, filename);

    console.log(`[Telegram] Rendered reply image`)
  }
}