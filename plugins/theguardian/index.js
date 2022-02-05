import moment from 'moment'
import GuardianHeader from './blocks/Header.js'
import { Plugin } from '../../core/index.js'

export default class GuardianPlugin extends Plugin {
  constructor() {
    super({
      baseUrl: 'https://content.guardianapis.com',
      qs: {
        'api-key': process.env.GUARDIAN_TOKEN
      }
    })
  }

  get hasFreshContent() {
    return true
  }

  get hasContent() {
    return true
  }


  async _searchArticles(query, section) {
    const { response } = await  this.http.get('/search', {
      qs: {
        'q': query,
        'section': section,
        'from-date': moment().format('YYYY-MM-DD'),
        'show-fields': 'headline,trailText,thumbnail',
        'order-by': 'relevance',
        'page-size': '50',
      }
    })

    if (response.status !== 'ok') {
      console.log(response)
      throw new Error('Unexpected response')
    }

    return response.results.map(({ id, sectionId, sectionName, fields }) => ({ id, sectionId, sectionName, ...fields }))
  }

  async fetch() {
    const [ukNews, worldNews] = await Promise.all([
      this._searchArticles('', 'uk-news'),
      this._searchArticles('', 'world'),
    ])

    console.log(ukNews, worldNews)
  }

  render(issue) {
    return [
      new GuardianHeader()
    ]
  }
}