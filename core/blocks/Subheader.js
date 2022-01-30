import moment from 'moment'
import Block from '../Block.js'

export default class BlockSubheader extends Block {
  constructor(contents) {
    super()
    this.contents = contents
  }

  // Render the current block to the canvas with
  // this.canvas, this.ctx, this.startPosY
  async render() {
    // Subheading backgruond
    this.ctx.beginPath()
    this.ctx.rect(0, this.startPosY, 500, 50)
    this.ctx.fillStyle = "black"
    this.ctx.fill()

    // Subheading
    this.ctx.font = "700 20px Montserrat"
    this.ctx.fillStyle = "white"
    this._fillTextCentered(this.contents, this.startPosY + 32)

    return { endPosY: this.startPosY + 50 }
  }
}