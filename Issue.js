import canvas from 'canvas'
import pIteration from 'p-iteration'
const { createCanvas, registerFont } = canvas
const { forEachSeries } = pIteration

registerFont(__dirname + '/core/fonts/staatliches.ttf', { family: 'Staatliches' })
registerFont(__dirname + '/core/fonts/gloria-hallelujah.ttf', { family: 'Gloria Hallelujah' })
registerFont(__dirname + '/core/fonts/montserrat-extralight.ttf', { family: 'Montserrat', weight: 200 })
registerFont(__dirname + '/core/fonts/montserrat-light.ttf', { family: 'Montserrat', weight: 300 })
registerFont(__dirname + '/core/fonts/montserrat-regular.ttf', { family: 'Montserrat', weight: 400 })
registerFont(__dirname + '/core/fonts/montserrat-medium.ttf', { family: 'Montserrat', weight: 500 })
registerFont(__dirname + '/core/fonts/montserrat-semibold.ttf', { family: 'Montserrat', weight: 600 })
registerFont(__dirname + '/core/fonts/montserrat-bold.ttf', { family: 'Montserrat', weight: 700 })
registerFont(__dirname + '/core/fonts/montserrat-extrabold.ttf', { family: 'Montserrat', weight: 800 })
registerFont(__dirname + '/core/fonts/yesevaone.ttf', { family: 'Yeseva One' })

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

    await forEachSeries(this.blocks, async (block, idx) => {
      console.log(`[Issue] Starting render of ${block.constructor.name}`)
      block._setupCanvas(this)
      try {
        const { endPosY } = await block.render()
        console.log(`[Issue] Rendered ${block.constructor.name} (${endPosY - this.height}px)`)
        this.height = endPosY
      } catch (err) {
        console.log(`[Issue] Failed to render ${block.constructor.name}`)
        console.log(err)
      }

      // try {
      //   const { endPosY: height } = await block.render()
      //   await block.renderToFile(idx, height)
      //   // Copy canvas from block to main
      //   // this.ctx.drawImage(block.canvas, 0, 0, 500, height, 0, this.height, 500, height)
      //   // console.log(`[Issue] Rendered ${block.constructor.name} (${height}px)`)
      //   this.height += height
      //   block.destroy()
      // } catch (err) {
      //   console.log(`[Issue] Failed to render ${block.constructor.name}`)
      //   console.log(err)
      // }
    })

    console.log(`[Issue] Final height ${this.height}px`)

    // To resize the canvas we create another canvas of the correct height and copy data
    const exporter = createCanvas(500, this.height)
    const exportCtx = exporter.getContext('2d')
    exportCtx.drawImage(this.canvas, 0, 0, 500, this.height, 0, 0, 500, this.height)

    console.log(`[Issue] Render complete`)

    return exporter.createPNGStream()
  }
}