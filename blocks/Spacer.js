import Block from '../Block.js'

export default class BlockSpacer extends Block {
  constructor(height = 20) {
    super()
    this.height = height
  }

  // Render the current block to the canvas with
  // this.canvas, this.ctx, this.startPosY
  render() {
    // Fill background white
    this.ctx.beginPath()
    this.ctx.rect(0, this.startPosY, 500, this.height)
    this.ctx.fillStyle = "white"
    this.ctx.fill()

    return { endPosY: this.startPosY + this.height }
  }
}