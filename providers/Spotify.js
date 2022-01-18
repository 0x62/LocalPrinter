import SpotifyClient from 'spotify-web-api-node'
import HttpClient from '../HttpClient.js'

const spotify = new SpotifyClient({
  clientId: process.env.SPOTIFY_CLIENT_ID,
  clientSecret: process.env.SPOTIFY_SECRET
})

// Fetch songs added to a playlist for wendy, if not seen before then print
// https://github.com/spotify/web-api/issues/519#issuecomment-618114678
// https://developer.spotify.com/documentation/general/guides/authorization/client-credentials/

export default class SpotifyProvider extends HttpClient {
  constructor() {
    super({
      baseUrl: '',
      headers: {}
    })

    this.hasFreshContent = true
  }

  async _fetchAllPlaylistTracks() {
    const LIMIT = 50
    const load = async (offset = 0) => {
      const tracks = await spotify.getPlaylistTracks(process.env.SPOTIFY_PLAYLIST, {
        offset,
        limit: LIMIT,
        fields: 'total, limit, items(added_at, track(name, uri, artists, album(name, images)))'
      })

      if (tracks.body.total > offset + LIMIT) {
        return [
          ...tracks.body.items,
          ...(await load(offset + LIMIT))
        ]
      }

      return tracks.body.items
    }

    return load()
  }

  async fetch() {
    const auth = await spotify.clientCredentialsGrant()
    spotify.setAccessToken(auth.body.access_token)

    this.tracks = await this._fetchAllPlaylistTracks()
    console.log(JSON.stringify(this.tracks, null, 2))
  }

  async cleanUp() {
    
  }
}