import Provider from '../Provider.js'

export default class QuoteProvider extends Provider {
  constructor(storage) {
    super({
      baseUrl: '',
      headers: {}
    })

    // this.hasFreshContent = true
  }

  async fetch({ updateOnly }) {
    
  }
}