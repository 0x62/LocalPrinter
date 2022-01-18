import HttpClient from '../HttpClient.js'

export default class QuoteProvider extends HttpClient {
  constructor() {
    super({
      baseUrl: '',
      headers: {}
    })

    // this.hasFreshContent = true
  }

  async fetch() {
    
  }

  async cleanUp() {
    
  }
}