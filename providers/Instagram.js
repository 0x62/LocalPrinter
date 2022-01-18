import HttpClient from '../HttpClient.js'

export default class InstagramProvider extends HttpClient {
  constructor() {
    super({
      baseUrl: `https://www.instagram.com`,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/97.0.4692.71 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
        'Cache-Control': 'max-age=0'
      }
    })
  }

  get hasFreshContent() {
    return !!this.latestPost
  }

  extractLatestPost(data) {
    const [{ node }] = data.graphql.user.edge_owner_to_timeline_media.edges
    return node
  }

  async fetch() {
    const data = await this.get(`/${process.env.INSTAGAM_USER}/?__a=1`)
    this.latestPost = this.extractLatestPost(data)
  }

  async cleanUp() {

  }
}