import NewsAPI from 'newsapi'
import LeadPhoto from './blocks/LeadPhoto.js'
import LeadHeadline from './blocks/LeadHeadline.js'
import { Plugin } from '../../core/index.js'

export default class NewsPlugin extends Plugin {
  constructor(apiKey) {
    super()
    this.api = new NewsAPI(apiKey)
  }

  get hasFreshContent() {
    return true
  }

  get hasContent() {
    return true
  }

  async fetch() {
    const { articles } = await this.api.v2.topHeadlines({ country: 'gb' })
    console.log(articles)

    this.data = {
      articles
    }
  }

  render(issue) {
    const [article] = this.data.articles.filter(({ urlToImage }) => !!urlToImage)

    return [
      new LeadPhoto(article.urlToImage),
      new LeadHeadline(article)
      // new GuardianHeader()
    ]
  }
}