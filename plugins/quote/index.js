import { Plugin, Blocks } from '../../core/index.js'

export default class QuotePlugin extends Plugin {
  constructor(storage) {
    super()

    // this.hasFreshContent = true
  }

  async fetch({ updateOnly }) {
    
  }

  render() {
    return [
      new Blocks.PosterText('The bad news is time flies. The good news is you’re the pilot.')
    ]
  }
}