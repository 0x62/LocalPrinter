import canvas from 'canvas'
import dither from 'canvas-dither'
import fs from 'fs'
const { createCanvas, loadImage, Image } = canvas

// Base class for a block
export default class Block {
  constructor() {
    this.canvas = null
  }

  destroy() {
    this.canvas = null
    this.ctx = null
  }

  async renderToFile(i, height) {
    try {
      // To resize the canvas we create another canvas of the correct size and copy data
      const exporter = createCanvas(500, height)
      const exportCtx = exporter.getContext('2d')
      exportCtx.drawImage(this.canvas, 0, 0, 500, height, 0, 0, 500, height)

      const TEMP_FILE = `output/block-${i}.png`
      const file = fs.createWriteStream(TEMP_FILE)
      const data = await exporter.createPNGStream()
      
      // Wait for file to be written
      await new Promise(r => {
        data.pipe(file)
        file.on('finish', () => r())
      })

      console.log(`[Block] rendered to ${TEMP_FILE}`)
    } catch (err) {
      console.log(`[Block] Error rendering block`)
      console.log(err)
    }
  }

  // Set the canvas and startPosY (called by IssueGenerator)
  _setupCanvas(issue) {
    // this.issue = issue
    // this.canvas = issue.canvas
    // this.ctx = issue.ctx
    // this.startPosY = issue.height
    this.issue = issue
    this.canvas = createCanvas(500, 2000)
    this.ctx = this.canvas.getContext('2d')
    this.startPosY = 0
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
    this._drawDitheredData(imgData, posX, posY)
  }

  _drawDitheredData(imgData, posX, posY) {
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