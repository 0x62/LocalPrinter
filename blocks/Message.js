import moment from 'moment'
import Block from '../Block.js'

export default class BlockMessage extends Block {
  constructor({ from, date, message, photo }) {
    super()
    this.from = from
    this.date = date
    this.message = message
    this.photo =
  }

  get messageTime() {
    return moment(this.date).format('h:mm A')
  }
  get messageDate() {
    return moment(this.date).format('MMMM Do YYYY').toUpperCase()
  }

  _planLines() {
    // Calculate the width of a space
    this.ctx.font = '32px Gloria Hallelujah'
    const { width: spaceWidth } = this.ctx.measureText(' ')

    // Calculate the width of each word
    const words = this.message.split(' ').map(word => {
      const { width } = this.ctx.measureText(word)
      return { width, word }
    })

    const lines = []
    let curWidth = 0 
    let curLine = ''

    while (words.length) {
      const { word, width } = words.shift()
      
      // If this word would make the line overflow move to next
      if (curWidth + spaceWidth + width > 420) {
        lines.push(curLine)
        curLine = ''
        curWidth = 0
      }

      // Safe to add word to line
      curLine += word + ' '
      curWidth += width + spaceWidth

      // Handle last line
      if (words.length === 0) {
        lines.push(curLine)
      }
    }

    return lines
  }

  _renderLine(yPos, contents) {
    const {
      actualBoundingBoxAscent: heightA,
      actualBoundingBoxDescent: heightD
    } = this.ctx.measureText(contents)
    const height = heightA + heightD

    this.ctx.fillText(contents, 40, yPos)

    // Create line under text
    this.ctx.strokeStyle = "black"
    this.ctx.lineWidth = 1
    this.ctx.beginPath()
    this.ctx.setLineDash([5, 20]);
    this.ctx.moveTo(40, yPos + 8)
    this.ctx.lineTo(440, yPos + 8)
    this.ctx.closePath()
    this.ctx.stroke()
  }

  // Render the current block to the canvas with
  // this.canvas, this.ctx, this.startPosY
  async render() {
    // Load the assets for the render
    const [frameX, frameY, title, postmark] = await Promise.all([
      this._loadImage('img/message-frame-x.png'),
      this._loadImage('img/message-frame-y.png'),
      this._loadImage('img/message-title.png'),
      this._loadImage('img/message-postmark.png'),
    ])

    // Message theory
    // 1. Render heading and message content line by line
    // 2. Calculate height of final message
    // 3. Render border around message (repeat frame image with rotation)

    // Draw top frame border and two sides to start with
    for (let i = 0; i < 3; i++) {
      this.ctx.drawImage(frameY, 0, this.startPosY + (70 * i), 25, 70) // left
      this.ctx.drawImage(frameY, 475, this.startPosY + (70 * i), 25, 70) // right
    }
    this.ctx.drawImage(frameX, 0, this.startPosY, 500, 25) // top

    // Draw postmark
    this.ctx.drawImage(postmark, 210, this.startPosY + 15, 300, 100)

    // Draw title image (Wendy Mail)
    // this.ctx.drawImage(title, 15, this.startPosY + 15, 252, 77)

    // Sender information/metadata
    this.ctx.fillStyle = "black"
    this.ctx.font = '700 22px Montserrat'
    this.ctx.fillText(this.messageDate, 40, this.startPosY + 130)
    // Calculate the width of the time to align to the right
    const { width } = this.ctx.measureText(this.messageTime)
    this.ctx.fillText(this.messageTime, 460 - width , this.startPosY + 130)

    this.ctx.font = '600 20px Montserrat'
    this.ctx.fillText(this.from.toUpperCase(), 40, this.startPosY + 160)

    if (this.)

    // Plan out the layout so the text wraps correctly
    const lines = this._planLines()

    // Loop through lines and render
    const LINE_SPACING = 25
    const LINE_HEIGHT = 33
    let yPos = this.startPosY + 220

    for (let i = 0; i < lines.length; i++) {
      this._renderLine(yPos, lines[i])
      yPos += LINE_HEIGHT + LINE_SPACING
    }

    // Reset line dash
    this.ctx.setLineDash([]);

    // Render the rest of the frame (remaining sides, bottom)
    const remainingHeight = yPos - (this.startPosY + 140)
    const frameItems = Math.ceil(remainingHeight / 70)

    for (let i = 0; i < frameItems; i++) {
      this.ctx.drawImage(frameY, 0, this.startPosY + 140 + (70 * i), 25, 70) // left
      this.ctx.drawImage(frameY, 475, this.startPosY + 140 + (70 * i), 25, 70) // right
    }

    // Recaulate the height to round to the vertical borders
    yPos = this.startPosY + 140 + (frameItems * 70)

    // Draw the bottom frame
    this.ctx.drawImage(frameX, 0, yPos - 25, 500, 25)

    return { endPosY: yPos }
  }
}