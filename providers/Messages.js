import HttpClient from '../HttpClient.js'

export default class MessagesProvider extends HttpClient {
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