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

  _drawRoundedRect(posX, posY, width, height, radius = 30, fill = true, stroke = false) {
    if (typeof radius === 'number') {
      radius = { tl: radius, tr: radius, br: radius, bl: radius };
    } else {
      const defaultRadius = {tl: 0, tr: 0, br: 0, bl: 0};
      for (const side in defaultRadius) {
        radius[side] = radius[side] || defaultRadius[side];
      }
    }

    this.ctx.beginPath();
    this.ctx.moveTo(posX + radius.tl, posY);
    this.ctx.lineTo(posX + width - radius.tr, posY);
    this.ctx.quadraticCurveTo(posX + width, posY, posX + width, posY + radius.tr);
    this.ctx.lineTo(posX + width, posY + height - radius.br);
    this.ctx.quadraticCurveTo(posX + width, posY + height, posX + width - radius.br, posY + height);
    this.ctx.lineTo(posX + radius.bl, posY + height);
    this.ctx.quadraticCurveTo(posX, posY + height, posX, posY + height - radius.bl);
    this.ctx.lineTo(posX, posY + radius.tl);
    this.ctx.quadraticCurveTo(posX, posY, posX + radius.tl, posY);
    this.ctx.closePath();
    if (fill) {
      this.ctx.fill();
    }
    if (stroke) {
      this.ctx.stroke();
    }
  }

  // Draw an image with dithered effect
  _drawDitheredImage(img, posX, posY, width, height) {
    this.ctx.drawImage(img, posX, posY, width, height)
    const imgData = this.ctx.getImageData(posX, posY, width, height)
    const dithered = dither.atkinson(imgData)
    this.ctx.putImageData(dithered, posX, posY)
  }

  // Draw a grayscale image
  _drawGsImage(img, posX, posY, width, height) {
    this.ctx.drawImage(img, posX, posY, width, height)
    const imgData = this.ctx.getImageData(posX, posY, width, height)
    this._convertToGs(imgData)
    this.ctx.putImageData(imgData, posX, posY);
  }

  _convertToGs(imgData) {
    const pixels = imgData.data
    for (let i = 0; i < pixels.length; i += 4) {
      // https://en.wikipedia.org/wiki/Grayscale#Colorimetric_(perceptual_luminance-preserving)_conversion_to_grayscale
      const lightness = 0.2126 * pixels[i] + 0.715 * pixels[i+1] + 0.0722 * pixels[i+2];
      pixels[i] = lightness;
      pixels[i + 1] = lightness;
      pixels[i + 2] = lightness;
    }
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