import moment from 'moment'
import { Block } from '../../../core/index.js'

export default class BlockSpotifyHeader extends Block {
  constructor() {
    super()
  }

  // Render the current block to the canvas with
  // this.canvas, this.ctx, this.startPosY
  async render() {
    // Line at the top
    this.ctx.strokeStyle = "black"
    this.ctx.lineWidth = 5
    this.ctx.beginPath()
    this.ctx.moveTo(0, this.startPosY)
    this.ctx.lineTo(500, this.startPosY)
    this.ctx.closePath()
    this.ctx.stroke()

    // Background diagonal stripes
    const NUMBER_OF_STRIPES = 59
    const BG_HEIGHT = 80
    const SPACING = 10
    this.ctx.lineWidth = 2

    for (let i = 0; i < NUMBER_OF_STRIPES; i++) {
      this.ctx.beginPath()
      const startX = (i * SPACING) - (BG_HEIGHT)
      const startY = this.startPosY
      const endX = (i * SPACING)
      const endY = this.startPosY + BG_HEIGHT

      this.ctx.moveTo(startX, startY)
      this.ctx.lineTo(endX, endY)
      this.ctx.closePath()
      this.ctx.stroke()
    }

    // Spotify logo
    const logo = await this._loadImage('plugins/spotify/img/logo.png')
    this.ctx.drawImage(logo, 250 - 80, this.startPosY + 12, 160, 57)

    return { endPosY: this.startPosY + BG_HEIGHT }
  }
}