import moment from 'moment'
import canvas from 'canvas'
import dither from 'canvas-dither'
import Block from '../Block.js'
const { createCanvas } = canvas

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
      this._loadImage('core/img/photo-frame.png')
    ])

    // Create a new canvas so we can center the image and crop to square
    const slot = createCanvas(410, 410)
    const slotCtx = slot.getContext('2d')
    const hRatio = 410 / image.width
    const vRatio = 410 / image.width
    const ratio = Math.min(hRatio, vRatio)
    const shiftX = (410 - image.width*ratio) / 2
    const shiftY = (410 - image.height*ratio) / 2
    slotCtx.drawImage(image, 0, 0, image.width, image.height, shiftX, shiftY, image.width * ratio, image.height * ratio)

    const imgData = slotCtx.getImageData(0, 0, 410, 410)
    this._convertToGs(imgData)
    this.ctx.putImageData(imgData, 45, this.startPosY + 45)

    this.ctx.drawImage(frame, 0, this.startPosY, 500, 500)

    return { endPosY: this.startPosY + 500 }
  }
}