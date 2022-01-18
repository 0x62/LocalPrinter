import HttpClient from '../HttpClient.js'

export default class WeatherProvider extends HttpClient {
  constructor() {
    super({
      baseUrl: '',
      headers: {}
    })
  }

  async fetch() {
    
  }

  async cleanUp() {

  }
}