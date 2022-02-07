import { Plugin } from '../../core/index.js'
import Forecast from './blocks/Forecast.js'

// Weather conditions to use warning element for
const WARN_CONDITIONS = ['Thunderstorm', 'Drizzle', 'Rain', 'Snow', 'Tornado']

export default class OpenWeatherPlugin extends Plugin {
  constructor(token, latLon, units = 'metric', lang = 'en') {
    super({
      baseUrl: 'https://api.openweathermap.org/data/2.5',
      qs: {
        appid: token,
      }
    })

    this.latLon = latLon.split(',')
    this.units = units
    this.lang = lang
  }

  get hasFreshContent() {
    return true
  }

  get hasContent() {
    return true
  }

  async fetch({ updateOnly }) {
    const [lat, lon] = this.latLon
    const { current, hourly, daily } = await this.http.get('/onecall', {
      qs: {
        lat,
        lon,
        units: this.units,
        lang: this.lang
      }
    })

    // Daily conditions
    const [today] = daily
    const [conditions] = today.weather
    const low = today.temp.min
    const high = today.temp.max

    // Get forecast items for next 6 hours and format
    const forecast = hourly.slice(1, 6).map(item => ({
      ts: item.dt,
      temp: item.feels_like,
      conditions: item.weather[0]
    }))

    this.data = {
      conditions,
      temp: Math.round(current.feels_like),
      low,
      high,
      forecast
    }

    console.log(this.data)
  }

  render(issue) {
    return [
      new Forecast(this.data)
    ]
  }
}