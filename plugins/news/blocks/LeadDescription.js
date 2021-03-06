import { Block } from '../../../core/index.js'

export default class BlockNewsLeadDescription extends Block {
  constructor(article) {
    super()
    this.article = article
  }

  _planLines(message) {
    // Calculate the width of a space
    this.ctx.font = "500 24px Montserrat"
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
      if (curWidth + spaceWidth + width > 460) {
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
    this.ctx.font = "500 24px Montserrat"
    this.ctx.fillStyle = "#000000"

    const {
      actualBoundingBoxAscent: heightA,
      actualBoundingBoxDescent: heightD
    } = this.ctx.measureText(contents)
    const height = heightA + heightD

    this.ctx.fillText(contents, 20, yPos)
  }

  // Render the current block to the canvas with
  // this.canvas, this.ctx, this.startPosY
  async render() {
    const [description] = this.article.description.split(' - ')
    console.log(`DEBUG [LeadDescription] planning lines for ${description}`)
    const lines = this._planLines(description)
    console.log(`DEBUG [LeadDescription] lines planned`)

    const LINE_SPACING = 18
    const LINE_HEIGHT = 18
    let yPos = this.startPosY + 48

    for (let i = 0; i < lines.length; i++) {
      const { text, width } = lines[i]
      this._renderLine(yPos, text)
      console.log(`DEBUG [LeadDescription] rendered text line ${i}`)
      if (i < lines.length - 1) {
        yPos += LINE_HEIGHT + LINE_SPACING
      }
    }

    return { endPosY: yPos }
  }
}