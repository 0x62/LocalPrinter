import Block from '../Block.js'

export default class BlockFooter extends Block {
  constructor() {
    super()
  }

  // Render the current block to the canvas with
  // this.canvas, this.ctx, this.startPosY
  render() {
    return { endPosY: this.startPosY }
  }
}