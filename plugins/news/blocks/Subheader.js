import { Block } from '../../../core/index.js'

export default class BlockNewsSubheader extends Block {
  constructor() {
    super()
  }

  // Render the current block to the canvas with
  // this.canvas, this.ctx, this.startPosY
  async render() {
    // Background shading
    this.ctx.beginPath()
    this.ctx.rect(0, this.startPosY, 500, 50)
    this.ctx.fillStyle = "#f5f5f5"
    this.ctx.closePath()
    this.ctx.fill()

    // Top line
    this.ctx.strokeStyle = "#a3a3a3"
    this.ctx.lineWidth = 2
    this.ctx.beginPath()
    this.ctx.moveTo(0, this.startPosY)
    this.ctx.lineTo(500, this.startPosY)
    this.ctx.closePath()
    this.ctx.stroke()

    // Bottom line
    this.ctx.beginPath()
    this.ctx.moveTo(0, this.startPosY + 50)
    this.ctx.lineTo(500, this.startPosY + 50)
    this.ctx.closePath()
    this.ctx.stroke()

    // Text
    this.ctx.font = "500 28px Montserrat"
    this.ctx.fillStyle = "#000000"

    this._fillTextFromTopLeft('ALSO IN THE NEWS', 20, this.startPosY + 14)

    return { endPosY: this.startPosY + 50 }
  }
}