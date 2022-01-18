import moment from 'moment'
import Block from '../Block.js'

export default class BlockHeader extends Block {
  constructor() {
    super()
  }

  // Render the current block to the canvas with
  // this.canvas, this.ctx, this.startPosY
  render() {
    // Background white
    this.ctx.beginPath()
    this.ctx.rect(0, this.startPosY, 500, 200)
    this.ctx.fillStyle = "white"
    this.ctx.fill()

    // Circle in middle
    const WIDTH = 95
    const HEIGHT = 63
    this.ctx.beginPath()
    this.ctx.rect((500 / 2) - (WIDTH / 2), 50, WIDTH, HEIGHT)
    this.ctx.fillStyle = "black"
    this.ctx.fill()

    // Issue number
    this.ctx.font = "600 42px Montserrat"
    this.ctx.fillStyle = "white"
    let text = this.issue.issueNo + ''
    let { width } = this.ctx.measureText(text)
    this.ctx.fillText(text, (500 - width) / 2, 64 + HEIGHT / 2)

    // Line above issue date
    this.ctx.strokeStyle = "black"
    this.ctx.lineWidth = 2
    this.ctx.beginPath()
    this.ctx.moveTo(0, 155)
    this.ctx.lineTo(500, 155)
    this.ctx.closePath()
    this.ctx.stroke()

    // Issue date
    this.ctx.fillStyle = "black"
    this.ctx.font = "600 28px Montserrat"
    text = moment(this.issue.issuedAt).format('MMMM Do YYYY, hA').toUpperCase();
    ({ width } = this.ctx.measureText(text));
    this.ctx.fillText(text, (500 - width) / 2, 185)

    // Line below
    this.ctx.beginPath()
    this.ctx.moveTo(0, 195)
    this.ctx.lineTo(500, 195)
    this.ctx.closePath()
    this.ctx.stroke()

    return { endPosY: this.startPosY + 200 }
  }
}