import moment from 'moment'
import Block from '../Block.js'

export default class BlockHeader extends Block {
  constructor() {
    super()
  }

  // Render the current block to the canvas with
  // this.canvas, this.ctx, this.startPosY
  render() {
    // Circle in middle
    const WIDTH = 95
    const HEIGHT = 63
    this.ctx.beginPath()
    this.ctx.rect((500 / 2) - (WIDTH / 2), 30, WIDTH, HEIGHT)
    this.ctx.fillStyle = "black"
    this.ctx.fill()

    // Issue number
    this.ctx.font = "600 42px Montserrat"
    this.ctx.fillStyle = "white"
    let text = this.issue.issueNo + ''
    this._fillTextCentered(text, 44 + HEIGHT / 2)

    // Issue date
    this.ctx.fillStyle = "black"
    this.ctx.font = "600 22px Montserrat"
    text = moment(this.issue.issuedAt).format('MMMM Do YYYY, hA').toUpperCase();
    this._fillTextCentered(text, 130)

    // Line above issue title
    this.ctx.strokeStyle = "black"
    this.ctx.lineWidth = 2
    this.ctx.beginPath()
    this.ctx.moveTo(0, 155)
    this.ctx.lineTo(500, 155)
    this.ctx.closePath()
    this.ctx.stroke()

    // Issue title
    this.ctx.font = "800 28px Montserrat";
    text = this.issue.updateOnly ? 'MORNING UPDATE' : 'THE DAILY WENDY'
    this._fillTextCentered(text, 185)

    // Line below
    this.ctx.beginPath()
    this.ctx.moveTo(0, 195)
    this.ctx.lineTo(500, 195)
    this.ctx.closePath()
    this.ctx.stroke()

    return { endPosY: this.startPosY + 200 }
  }
}