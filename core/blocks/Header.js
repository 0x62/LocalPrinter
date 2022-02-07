import moment from 'moment'
import Block from '../Block.js'

export default class BlockHeader extends Block {
  constructor(issueTitle) {
    super()
    this.issueTitle = issueTitle
  }

  // Render the current block to the canvas with
  // this.canvas, this.ctx, this.startPosY
  render() {
    this.ctx.font = "600 32px Montserrat"
    let text = this.issue.issueNo + ''
    const { width } = this.ctx.measureText(text)

    // Circle in middle
    const WIDTH = width + 40
    const HEIGHT = 60
    this.ctx.beginPath()
    this.ctx.rect((500 / 2) - (WIDTH / 2), 30, WIDTH, HEIGHT)
    this.ctx.fillStyle = "black"
    this.ctx.closePath()
    this.ctx.fill()

    // Issue number
    this.ctx.fillStyle = "white"
    this._fillTextCentered(text, 40 + HEIGHT / 2)

    // Issue date
    this.ctx.fillStyle = "black"
    this.ctx.font = "600 22px Montserrat"
    text = moment(this.issue.issuedAt).format('MMMM Do YYYY, hA').toUpperCase();
    this._fillTextCentered(text, 130)

    // Issue title background
    this.ctx.beginPath()
    this.ctx.rect(0, 155, 500, 65)
    this.ctx.fillStyle = "black"
    this.ctx.closePath()
    this.ctx.fill()

    // Issue title
    this.ctx.fillStyle = "white"
    this.ctx.font = "800 28px Montserrat";
    text = this.issue.updateOnly ? this.issueTitle.update : this.issueTitle.full
    this._fillTextCentered(text, 195)

    return { endPosY: this.startPosY + 220 }
  }
}