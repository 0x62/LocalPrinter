import moment from 'moment'
import canvas from 'canvas'
import dither from 'canvas-dither'
import Block from '../Block.js'
const { createCanvas } = canvas

export default class BlockPhoto extends Block {
  constructor({ url, caption, framed = false }) {
    super()
    this.url = url
    this.caption = caption
    this.framed = framed
  }

  // Render the current block to the canvas with
  // this.canvas, this.ctx, this.startPosY
  async render() {
    const [image, frame] = await Promise.all([
      this._loadRemoteImage(this.url),
      this._loadImage('core/img/photo-frame.png')
    ])

    const SIZE = this.framed ? 410 : 500
    const FRAME_OFFSET = this.framed ? 45 : 0

    // Create a new canvas so we can center the image and crop to square
    const slot = createCanvas(SIZE, SIZE)
    const slotCtx = slot.getContext('2d')
    const hRatio = SIZE / image.width
    const vRatio = SIZE / image.width
    const ratio = Math.min(hRatio, vRatio)
    const shiftX = (SIZE - image.width*ratio) / 2
    const shiftY = (SIZE - image.height*ratio) / 2
    slotCtx.drawImage(image, 0, 0, image.width, image.height, shiftX, shiftY, image.width * ratio, image.height * ratio)

    const imgData = slotCtx.getImageData(0, 0, SIZE, SIZE)
    this._convertToGs(imgData)
    this.ctx.putImageData(imgData, FRAME_OFFSET, this.startPosY + FRAME_OFFSET)

    if (this.framed) {
      this.ctx.drawImage(frame, 0, this.startPosY, 500, 500)
    }

    return { endPosY: this.startPosY + 500 }
  }
}