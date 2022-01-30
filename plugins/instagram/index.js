import { Plugin, Blocks } from '../../core/index.js'

// Note: This uses an undocumented Instagram API to fetch a surprisingly large amount of data in one
// unauthenticated request. That said, it will inevitably break at some point.

export default class InstagramPlugin extends Plugin {
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
    return this.hasContent && !this.isIdSeen(this.data.latestPost.id)
  }

  get hasContent() {
    return this.data.latestPost
  }

  extractPosts(data) {
    return data.graphql.user.edge_owner_to_timeline_media.edges
      .map(({ node }) => ({
        id: node.id,
        url: node.thumbnail_src,
        caption: node.edge_media_to_caption.edges[0].node.text,
      }))
  }

  extractLatestPost(data) {
    const [{ node }] = data.graphql.user.edge_owner_to_timeline_media.edges
    return node
  }

  async fetch({ updateOnly }) {
    const data = await this.http.get(`/${process.env.INSTAGAM_USER}/?__a=1`)
    const posts = this.extractPosts(data)
    const latestPost = posts[0]

    if (updateOnly) {
      this.markSeenOnCleanUp(posts, ({ id }) => id)
    }

    this.data = {
      latestPost,
      posts,
    }
  }

  render(issue) {
    return [
      new Blocks.Photo(this.data.latestPost)
    ]
  }
}