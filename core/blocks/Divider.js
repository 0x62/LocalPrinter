import Block from '../Block.js'

export default class BlockDivider extends Block {
  constructor(type = 'solid') {
    super()
    this.type = type
  }

  // Render the current block to the canvas with
  // this.canvas, this.ctx, this.startPosY
  render() {
    this.ctx.strokeStyle = "black"
    this.ctx.lineWidth = 2
    this.ctx.beginPath()
    if (this.type === 'dashed') {
      this.ctx.setLineDash([5, 15]);
    } else {
      this.ctx.setLineDash([])
    }
    this.ctx.moveTo(0, this.startPosY)
    this.ctx.lineTo(500, this.startPosY)
    this.ctx.closePath()
    this.ctx.stroke()
    this.ctx.setLineDash([])

    return { endPosY: this.startPosY + 2 }
  }
}