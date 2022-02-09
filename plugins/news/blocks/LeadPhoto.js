import canvas from 'canvas'
const { createCanvas } = canvas
import { Block } from '../../../core/index.js'

export default class BlockNewsLeadPhoto extends Block {
  constructor(url) {
    super()
    this.url = url
  }

   // Set the canvas and startPosY (called by IssueGenerator)
  _setupCanvas(issue) {
    // this.issue = issue
    // this.canvas = issue.canvas
    // this.ctx = issue.ctx
    // this.startPosY = issue.height
    this.issue = issue
    this.canvas = createCanvas(500, 250)
    this.ctx = this.canvas.getContext('2d')
    this.startPosY = 0
  }

  // Render the current block to the canvas with
  // this.canvas, this.ctx, this.startPosY
  async render() {
    const image = await this._loadRemoteImage(this.url)
    const WIDTH = 500, HEIGHT = 250

    const hRatio = WIDTH / image.width
    const vRatio = HEIGHT / image.height
    const ratio = Math.max(hRatio, vRatio)
    const shiftX = (WIDTH - image.width*ratio) / 2
    const shiftY = (HEIGHT - image.height*ratio) / 2
    this.ctx.drawImage(image, 0, 0, image.width, image.height, shiftX, shiftY, image.width * ratio, image.height * ratio)

    return { endPosY: this.startPosY + HEIGHT }
  }
}