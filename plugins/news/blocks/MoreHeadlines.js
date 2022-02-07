import { Block } from '../../../core/index.js'

export default class BlockNewsMoreHeadlines extends Block {
  constructor(headlines) {
    super()
    this.headlines = headlines
  }

  _planLines(message) {
    // Calculate the width of a space
    this.ctx.font = "500 22px Montserrat"
    const { width: spaceWidth } = this.ctx.measureText(' ')

    // Calculate the width of each word
    const words = message.split(' ').map(word => {
      const { width } = this.ctx.measureText(word)
      return { width, word }
    })

    const lines = []
    let curWidth = 0 
    let curLine = ''

    while (words.length) {
      const { word, width } = words.shift()
      
      // If this word would make the line overflow move to next
      if (curWidth + spaceWidth + width > 445) {
        lines.push({ text: curLine, width: curWidth })
        curLine = ''
        curWidth = 0
      }

      // Safe to add word to line
      curLine += word + ' '
      curWidth += width + spaceWidth

      // Handle last line
      if (words.length === 0) {
        lines.push({ text: curLine, width: curWidth })
      }
    }

    return lines
  }

  _renderLine(yPos, contents) {
    // Calculate the width of a space
    this.ctx.font = "500 22px Montserrat"
    this.ctx.fillStyle = "#000000"

    const {
      actualBoundingBoxAscent: heightA,
      actualBoundingBoxDescent: heightD
    } = this.ctx.measureText(contents)
    const height = heightA + heightD

    this.ctx.fillText(contents, 45, yPos)
  }

  _renderBullet(yPos) {
    const RADIUS = 5
    this.ctx.beginPath()
    this.ctx.arc(25, yPos, RADIUS, 0, 2 * Math.PI, false)
    this.ctx.closePath()
    this.ctx.fill()
  }

  // Render the current block to the canvas with
  // this.canvas, this.ctx, this.startPosY
  async render() {
    const headlines = this.headlines.map(headline => this._planLines(headline)).slice(0, 3)

    const ITEM_SPACING = 46
    const LINE_SPACING = 32
    let yPos = this.startPosY + (LINE_SPACING / 2)

    for (let i = 0; i < headlines.length; i++) {
      const lines = headlines[i]
      // For each headline also print a bullet
      this._renderBullet(yPos - 8)
      for (let j = 0; j < lines.length; j++) {
        const { text, width } = lines[j]
        this._renderLine(yPos, text)
        if (j < lines.length - 1) {
          yPos += LINE_SPACING
        }
      }
      if (i < headlines.length - 1) {
        yPos += ITEM_SPACING
      } else {
        yPos += ITEM_SPACING / 2
      }
    }

    return { endPosY: yPos }
  }
}