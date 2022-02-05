import { Block } from '../../../core/index.js'

export default class BlockGuardianHeader extends Block {
  constructor() {
    super()
  }

  // Render the current block to the canvas with
  // this.canvas, this.ctx, this.startPosY
  async render() {
    // Guardian logo
    const logo = await this._loadImage('plugins/theguardian/img/logo.png')
    this._drawGsImage(logo, 0, this.startPosY, 450, 78)

    // Headlines title
    // Issue title
    this.ctx.font = "600 24px Montserrat"
    this._fillTextFromTopLeft(`HEADLINES: 8AM, 12 NOV 2022`, 0, this.startPosY + 86)

    this.ctx.strokeStyle = "black"
    this.ctx.lineWidth = 3
    this.ctx.beginPath()
    this.ctx.moveTo(0, this.startPosY + 116)
    this.ctx.lineTo(500, this.startPosY + 116)
    this.ctx.closePath()
    this.ctx.stroke()

    return { endPosY: this.startPosY + 70 }
  }
}