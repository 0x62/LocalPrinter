import canvas from 'canvas'
import dither from 'canvas-dither'
const { Image, loadImage } = canvas

// Base class for a block
export default class Block {
  constructor() {
    this.canvas = null
    this.startPosY = null
  }

  // Set the canvas and startPosY (called by IssueGenerator)
  _setupCanvas(issue) {
    this.issue = issue
    this.canvas = issue.canvas
    this.ctx = issue.ctx
    this.startPosY = issue.height
  }

  _loadRemoteImage(src) {
    return new Promise(r => {
      const img = new Image()
      img.src = src
      img.onload = () => r(img)
    })
  }

  _loadImage(src) {
    return loadImage(src)
  }

  _drawDitheredImage(img, posX, posY, width, height) {
    this.ctx.drawImage(img, posX, posY, width, height)
    const imgData = this.ctx.getImageData(posX, posY, width, height)
    const dithered = dither.atkinson(imgData)
    this.ctx.putImageData(dithered, posX, posY)
  }

  _fillTextFromTopLeft(text, posX, posY) {
    let {
      actualBoundingBoxAscent: heightA,
      actualBoundingBoxDescent: heightD
    } = this.ctx.measureText(text)

    this.ctx.fillText(text, posX, posY + heightA + heightD)
  }

  _fillTextCentered(text, posY) {
    let { width } = this.ctx.measureText(text)
    this.ctx.fillText(text, 250 - (width / 2), posY)
  }
}