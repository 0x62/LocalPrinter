import canvas from 'canvas'
const { createCanvas } = canvas
import { Block } from '../../../core/index.js'

export default class BlockNewsLeadPhoto extends Block {
  constructor(url) {
    super()
    this.url = url
  }

  _

  // Render the current block to the canvas with
  // this.canvas, this.ctx, this.startPosY
  async render() {
    const image = await this._loadRemoteImage(this.url)
    const WIDTH = 500, HEIGHT = 250

    // Create a new canvas so we can center the image and crop to square
    const slot = createCanvas(WIDTH, HEIGHT)
    const slotCtx = slot.getContext('2d')
    const hRatio = WIDTH / image.width
    const vRatio = HEIGHT / image.height
    const ratio = Math.max(hRatio, vRatio)
    const shiftX = (WIDTH - image.width*ratio) / 2
    const shiftY = (HEIGHT - image.height*ratio) / 2
    slotCtx.drawImage(image, 0, 0, image.width, image.height, shiftX, shiftY, image.width * ratio, image.height * ratio)

    const imgData = slotCtx.getImageData(0, 0, WIDTH, HEIGHT)
    this._convertToGs(imgData)
    this.ctx.putImageData(imgData, 0, this.startPosY)

    return { endPosY: this.startPosY + HEIGHT }
  }
}