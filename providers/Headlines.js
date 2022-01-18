import HttpClient from '../HttpClient.js'

export default class HeadlinesProvider extends HttpClient {
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