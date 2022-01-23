import Provider from '../Provider.js'

export default class WeatherProvider extends Provider {
  constructor() {
    super({
      baseUrl: '',
      headers: {}
    })
  }

  async fetch({ updateOnly }) {
    
  }
}