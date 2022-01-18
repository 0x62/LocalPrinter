import moment from 'moment'
import Block from '../Block.js'

export default class BlockPhoto extends Block {
  constructor({ url, caption }) {
    super()
    this.url = url
    this.caption = caption
  }

  // Render the current block to the canvas with
  // this.canvas, this.ctx, this.startPosY
  async render() {
    const [image, frame] = await Promise.all([
      this._loadRemoteImage(this.url),
      this._loadImage('img/photo-frame.png')
    ])

    // Draw album art and scan code
    this._drawDitheredImage(image, 45, this.startPosY + 45, 410, 410)

    this.ctx.drawImage(frame, 0, this.startPosY, 500, 500)

    return { endPosY: this.startPosY + 500 }
  }
}