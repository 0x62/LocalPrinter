import moment from 'moment'
import Block from '../Block.js'

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
    const logo = await this._loadImage('img/spotify.png')
    this.ctx.drawImage(logo, 250 - 80, this.startPosY + 12, 160, 57)

    // Subheading backgruond
    this.ctx.beginPath()
    this.ctx.rect(0, this.startPosY + BG_HEIGHT, 500, 50)
    this.ctx.fillStyle = "black"
    this.ctx.fill()

    // Subheading
    this.ctx.font = "700 20px Montserrat"
    this.ctx.fillStyle = "white"
    this._fillTextCentered('GIVE THESE A LISTEN', this.startPosY + BG_HEIGHT + 32)

    return { endPosY: this.startPosY + 150 }
  }
}