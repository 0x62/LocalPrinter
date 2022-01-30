import Block from '../Block.js'

const fontStr = size => `${size}px Staatliches`
const MIN_FONT_SIZE = 60
const MAX_FONT_SIZE = 300
const MAX_LINE_WIDTH = 480
const MAX_LINE_HEIGHT = 200
const FONT_INCREMENT = 1
const LINE_SPACING = 16

export default class BlockPosterText extends Block {
  constructor(text) {
    super()
    this.text = text
  }

  // Render the current block to the canvas with
  // this.canvas, this.ctx, this.startPosY
  render() {
    console.log(`starting render`, { startPosY: this.startPosY, height: this.canvas.height - this.startPosY })

    this.ctx.font = fontStr(MIN_FONT_SIZE);
    this.ctx.fillStyle = "black"
    const words = this.text.split(" ")
    let posY = this.startPosY
    
    while (words.length) {
      let curString = words.shift()
      let curSize = MIN_FONT_SIZE
      let height
      
      // This algorithm is pretty horrible and essentially bruteforces the layout, but performs okay
      // with the kind of text we're expecting
      while (curSize < MAX_FONT_SIZE) {
        this.ctx.font = fontStr(curSize);
        let {
          width,
          actualBoundingBoxAscent: heightA,
          actualBoundingBoxDescent: heightD
        } = this.ctx.measureText(curString)
        
        height = heightA + heightD
        
        if (width < MAX_LINE_WIDTH && height < MAX_LINE_HEIGHT) {
          // If both under max then increase size and try again
          curSize += FONT_INCREMENT
          continue
        } else if (height > MAX_LINE_HEIGHT) {
          // Height has gotten too big first, add another word, reset font size to minimum and start
          // over incrementing again
          const nextWord = words.shift()
          if (nextWord) {
            curString += " " + nextWord
            curSize = MIN_FONT_SIZE
            continue
          }
          
          // We don't have another word to add so just make this a little bigger than the max
          curSize += FONT_INCREMENT * 2
          break
        } else {
          // Reduce size by one increment to undo last increase
          curSize -= FONT_INCREMENT
          break
        }
      }

      // Measure height again
      let {
        actualBoundingBoxAscent: heightA,
        actualBoundingBoxDescent: heightD
      } = this.ctx.measureText(curString)
      
      height = heightA + heightD
      
      // Now found font size, write text
      posY += height
      this.ctx.fillText(curString, 10, posY)
      posY += LINE_SPACING
      
      // TODO: should add some check here for emojis and reduce the font size
    }

    console.log(`rendered text`, { posY, words })

    return { endPosY: posY }
  }
}