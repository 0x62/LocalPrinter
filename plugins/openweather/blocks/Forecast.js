import moment from 'moment'
import { Block } from '../../../core/index.js'

const capitalize = str => str.charAt(0).toUpperCase() + str.slice(1);
const fmtTemp = temp => `${Math.round(temp)}°`

export default class BlockForecast extends Block {
  constructor({ conditions, temp, high, low, forecast }) {
    super()
    this.conditions = conditions
    this.temp = temp
    this.high = high
    this.low = low
    this.forecast = forecast
  }

  // Render a column in the hourly forecast
  _renderColumn(i, forecast, icon) {
    const COL_COUNT = 5
    const SPACING = 10
    const COL_WIDTH = (490 - (SPACING * (COL_COUNT - 1))) / COL_COUNT
    const xPos = (COL_WIDTH * i) + (SPACING * i)

    // Forecast time
    this.ctx.font = "500 26px Montserrat"
    const hour = moment(forecast.ts * 1000).format('HH')
    const { width: timeWidth } = this.ctx.measureText(hour)

    // Time header
    this.ctx.fillText(hour, xPos + (COL_WIDTH / 2) - (timeWidth / 2), this.startPosY + 185)

    // Daily forecast icon
    this._drawDitheredImage(icon, xPos, this.startPosY + 180, COL_WIDTH, COL_WIDTH)

    // Temperature
    this.ctx.font = "600 28px Montserrat"
    const tempText = fmtTemp(forecast.temp)
    const { width: tempWidth } = this.ctx.measureText(tempText)
    this.ctx.fillText(tempText, xPos + (COL_WIDTH / 2) - (tempWidth / 2), this.startPosY + 290)
  }

  // Render the current block to the canvas with
  // this.canvas, this.ctx, this.startPosY
  async render() {
    // Load the icons for today and hourly forecast
    const [dailyIcon, ...hourlyIcons] = await Promise.all([
      this._loadRemoteImage(`http://openweathermap.org/img/wn/${this.conditions.icon}@2x.png`),
      ...this.forecast.map(({ conditions }) => 
        this._loadRemoteImage(`http://openweathermap.org/img/wn/${conditions.icon}@2x.png`)
      )
    ])

    console.log('DEBUG [Forecast] Loaded images')

    // Daily forecast icon
    this._drawDitheredImage(dailyIcon, -10, this.startPosY, 160, 160)

    console.log('DEBUG [Forecast] Daily icon drawn')

    // Background diagonal stripes
    const NUMBER_OF_STRIPES = 59
    const BG_HEIGHT = 22
    const SPACING = 10
    this.ctx.lineWidth = 2
    this.ctx.strokeStyle = "#737373"
    for (let i = 0; i < NUMBER_OF_STRIPES; i++) {
      this.ctx.beginPath()
      const startX = (i * SPACING) + (BG_HEIGHT)
      const startY = this.startPosY
      const endX = (i * SPACING)
      const endY = this.startPosY + BG_HEIGHT

      this.ctx.moveTo(startX, startY)
      this.ctx.lineTo(endX, endY)
      this.ctx.closePath()
      this.ctx.stroke()
    }

    console.log('DEBUG [Forecast] bg stripes drawn')

    // Measure the width of the text and cover in white rect
    this.ctx.font = "700 26px Montserrat"
    const { width: titleWidth } = this.ctx.measureText('WEATHER FORECAST')

    console.log('DEBUG [Forecast] title measured')

    this.ctx.beginPath()
    this.ctx.rect(0, this.startPosY - 1, titleWidth + 20, 24)
    this.ctx.fillStyle = "white"
    this.ctx.closePath()
    this.ctx.fill()

    console.log('DEBUG [Forecast] title bg drawn')

    // Weather title
    this.ctx.fillStyle = 'black'
    this.ctx.fillText('WEATHER FORECAST', 0, this.startPosY + 20)

    console.log('DEBUG [Forecast] title drawn')

    // Daily forecast labels
    this.ctx.fillText(this.conditions.main, 130, this.startPosY + 70)
    this.ctx.font = "500 24px Montserrat"
    this.ctx.fillText(capitalize(this.conditions.description), 130, this.startPosY + 105)

    console.log('DEBUG [Forecast] conditions drawn')

    // Current temperature
    this.ctx.font = "500 52px Montserrat"
    const tempText = fmtTemp(this.temp)
    const { width: tempWidth } = this.ctx.measureText(tempText)
    this.ctx.fillText(tempText, 500 - tempWidth, this.startPosY + 95)

    console.log('DEBUG [Forecast] temperature drawn')

    // Dividing line
    this.ctx.strokeStyle = "#a3a3a3"
    this.ctx.lineWidth = 1
    this.ctx.beginPath()
    this.ctx.moveTo(0, this.startPosY + 140)
    this.ctx.lineTo(500, this.startPosY + 140)
    this.ctx.closePath()
    this.ctx.stroke()

    console.log('DEBUG [Forecast] divider drawn')

    for (let i = 0; i < 5; i++) {
      this._renderColumn(i, this.forecast[i], hourlyIcons[i])
      console.log(`DEBUG [Forecast] column ${i} drawn`)
    }

    // this.ctx.strokeStyle = '#d4d4d4'
    // this.ctx.lineWidth = 4

    // // Background border
    // this._drawRoundedRect(5, this.startPosY, 490, 300, 25, false, true)

    // // Daily conditions at the top
    // this.ctx.font = "500 24px Montserrat"
    // this.ctx.fillStyle = 'black'
    // this.ctx.fillText(capitalize(this.conditions.description), 20, this.startPosY + 40)

    // for (let i = 0; i < 6; i++) {
    //   this._renderColumn(i)
    // }

    return { endPosY: this.startPosY + 305 }
  }
}