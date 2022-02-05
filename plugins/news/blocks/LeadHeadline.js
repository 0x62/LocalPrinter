import { Block } from '../../../core/index.js'

export default class BlockNewsLeadHeadline extends Block {
  constructor(article) {
    super()
    this.article = article
  }

  // Render the current block to the canvas with
  // this.canvas, this.ctx, this.startPosY
  async render() {
    

    return { endPosY: this.startPosY }
  }
}