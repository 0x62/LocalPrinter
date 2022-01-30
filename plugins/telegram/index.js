import TelegramBot from 'node-telegram-bot-api'
import { Plugin, Blocks } from '../../core/index.js'
import Message from './blocks/Message.js'

const bot = new TelegramBot(process.env.TELEGRAM_TOKEN, { polling: true })
const ALLOWED_USERS = [1689019195]

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

      if (msg.text) {
        // Plain text message
        this.data.newMessages.push({
          id: msg.message_id,
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

      bot.sendMessage(msg.chat.id, 'Got your message!')
      this.emit('update')
    })
  }

  render(issue) {
    const blocks = []
    const { messages, newMessages } = this.data

    const addMessage = msg => {
      if (msg.photo) {
        blocks.push(new Blocks.Photo({ url: msg.photo }))
      } else {
        blocks.push(new Message(msg))
      }
    }

    if (issue.updateOnly) {
      // Show all unseen messages
      mewMessages.forEach((message, idx) => {
        addMessage(message)
        if (idx < newMessages.length - 1) {
          blocks.push(new Blocks.Spacer(15))
        }
      })
    } else {
      // Regular issue shows the last message received
      addMessage(messages[0])
    }

    return blocks
  }
}