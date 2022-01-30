import { Plugin } from '../../core/index.js'

export default class OpenWeatherPlugin extends Plugin {
  constructor() {
    super({
      baseUrl: '',
      headers: {}
    })
  }

  async fetch({ updateOnly }) {
    
  }

  render(issue) {
    return []
  }
}