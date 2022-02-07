import NewsAPI from 'newsapi'
import LeadPhoto from './blocks/LeadPhoto.js'
import LeadHeadline from './blocks/LeadHeadline.js'
import LeadDescription from './blocks/LeadDescription.js'
import Subheader from './blocks/Subheader.js'
import MoreHeadlines from './blocks/MoreHeadlines.js'
import { Plugin, Blocks } from '../../core/index.js'

export default class NewsPlugin extends Plugin {
  constructor(apiKey, condensedUpdate) {
    super()
    this.api = new NewsAPI(apiKey)
    this.condensedUpdate = condensedUpdate
  }

  get hasFreshContent() {
    return this.data.articles.length > 0
  }

  get hasContent() {
    return this.data.articles.length > 0
  }

  async fetch() {
    const { articles } = await this.api.v2.topHeadlines({ country: 'gb' })
    
    this.data = {
      articles
    }
  }

  render(issue) {
    const [article, ...otherHeadlines] = this.data.articles.filter(({ urlToImage }) => !!urlToImage)
    const headlines = otherHeadlines.map(article => article.title.split(' - ')[0])

    if (issue.updateOnly && this.condensedUpdate) {
      return [
        new LeadHeadline(article),
        new Blocks.Spacer(30),
        new Subheader(),
        new Blocks.Spacer(30),
        new MoreHeadlines(headlines)
      ]
    }

    return [
      new LeadPhoto(article.urlToImage),
      new Blocks.Spacer(10),
      new LeadHeadline(article),
      new LeadDescription(article),
      new Blocks.Spacer(30),
      new Subheader(),
      new Blocks.Spacer(30),
      new MoreHeadlines(headlines)
      // new GuardianHeader()
    ]
  }
}