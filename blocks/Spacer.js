import Block from '../Block.js'

export default class BlockSpacer extends Block {
  constructor(height = 20) {
    super()
    this.height = height
  }

  // Render the current block to the canvas with
  // this.canvas, this.ctx, this.startPosY
  render() {
    return { endPosY: this.startPosY + this.height }
  }
}