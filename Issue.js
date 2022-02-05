import canvas from 'canvas'
import pIteration from 'p-iteration'
const { createCanvas, registerFont } = canvas
const { forEachSeries } = pIteration

registerFont('core/fonts/staatliches.ttf', { family: 'Staatliches' })
registerFont('core/fonts/gloria-hallelujah.ttf', { family: 'Gloria Hallelujah' })
registerFont('core/fonts/montserrat-extralight.ttf', { family: 'Montserrat', weight: 200 })
registerFont('core/fonts/montserrat-light.ttf', { family: 'Montserrat', weight: 300 })
registerFont('core/fonts/montserrat-regular.ttf', { family: 'Montserrat', weight: 400 })
registerFont('core/fonts/montserrat-medium.ttf', { family: 'Montserrat', weight: 500 })
registerFont('core/fonts/montserrat-semibold.ttf', { family: 'Montserrat', weight: 600 })
registerFont('core/fonts/montserrat-bold.ttf', { family: 'Montserrat', weight: 700 })
registerFont('core/fonts/montserrat-extrabold.ttf', { family: 'Montserrat', weight: 800 })
registerFont('core/fonts/yesevaone.ttf', { family: 'Yeseva One' })

export default class Issue {
  constructor({ issueNo, issuedAt, updateOnly, realtime }) {
    this.blocks = []
    this.height = 0
    this.issueNo = issueNo
    this.issuedAt = issuedAt
    this.updateOnly = updateOnly
    this.realtime = realtime
  }

  addBlocks(...blocks) {
    this.blocks = [
      ...this.blocks,
      ...blocks
    ]
    return this
  }

  async render() {
    console.log(`[Issue] Starting render`)

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
      try {
        const { endPosY } = await block.render()
        console.log(`[Issue] Rendered ${block.constructor.name} (${endPosY - this.height}px)`)
        this.height = endPosY
      } catch (err) {
        console.log(`[Issue] Failed to render ${block.constructor.name}`)
        console.log(err)
      }
    })

    console.log(`[Issue] Final height ${this.height}px`)

    const PRINT_WIDTH = 384
    const PRINT_HEIGHT = (PRINT_WIDTH / 500) * this.height

    // To resize the canvas we create another canvas of the correct size and copy data
    const exporter = createCanvas(PRINT_WIDTH, PRINT_HEIGHT)
    const exportCtx = exporter.getContext('2d')
    exportCtx.drawImage(this.canvas, 0, 0, 500, this.height, 0, 0, PRINT_WIDTH, PRINT_HEIGHT)

    console.log(`[Issue] Render complete`)

    return exporter.createPNGStream()
  }
}