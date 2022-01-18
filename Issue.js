import canvas from 'canvas'
import pIteration from 'p-iteration'
const { createCanvas, registerFont } = canvas
const { forEachSeries } = pIteration

registerFont('fonts/staatliches.ttf', { family: 'Staatliches' })
registerFont('fonts/gloria-hallelujah.ttf', { family: 'Gloria Hallelujah' })
registerFont('fonts/montserrat-extralight.ttf', { family: 'Montserrat', weight: 200 })
registerFont('fonts/montserrat-light.ttf', { family: 'Montserrat', weight: 300 })
registerFont('fonts/montserrat-regular.ttf', { family: 'Montserrat', weight: 400 })
registerFont('fonts/montserrat-medium.ttf', { family: 'Montserrat', weight: 500 })
registerFont('fonts/montserrat-semibold.ttf', { family: 'Montserrat', weight: 600 })
registerFont('fonts/montserrat-bold.ttf', { family: 'Montserrat', weight: 700 })
registerFont('fonts/montserrat-extrabold.ttf', { family: 'Montserrat', weight: 800 })

export default class Issue {
  constructor({ issueNo, issuedAt }) {
    this.blocks = []
    this.height = 0
    this.issueNo = issueNo
    this.issuedAt = issuedAt
  }

  addBlocks(...blocks) {
    this.blocks = [
      ...this.blocks,
      ...blocks
    ]
    return this
  }

  async render() {
    // Render theory
    // 1. Create a canvas element of width 500 and height 10,000
    // 2. Loop through blocks, setting canvas element and yPos of previous block
    // 3. Render each block to the canvas, calculate height and update last position
    // 4. Resize canvas height to last yPos to trim
    // 5. Render to image file, upload/email for record keeping then print
    this.canvas = createCanvas(500, 5000)
    this.ctx = this.canvas.getContext('2d')

    // Fill the canvas in white
    this.ctx.beginPath()
    this.ctx.rect(0, 0, this.canvas.width, this.canvas.height)
    this.ctx.fillStyle = "white"
    this.ctx.closePath()
    this.ctx.fill()

    await forEachSeries(this.blocks, async block => {
      block._setupCanvas(this)
      const { endPosY } = await block.render()
      this.height = endPosY
    })

    console.log(`final height = ${this.height}`)

    // To resize the canvas we create another canvas of the correct size and copy data
    const exporter = createCanvas(500, this.height)
    const exportCtx = exporter.getContext('2d')
    exportCtx.drawImage(this.canvas, 0, 0, 500, this.height, 0, 0, 500, this.height)

    console.log(`created export ctx with height ${this.height}`)

    return exporter.createPNGStream()
  }
}