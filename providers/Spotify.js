import SpotifyClient from 'spotify-web-api-node'

const spotify = new SpotifyClient({
  clientId: process.env.SPOTIFY_CLIENT_ID,
  clientSecret: process.env.SPOTIFY_SECRET
})

// Fetch songs added to a playlist for wendy, if not seen before then print
export default class SpotifyProvider {
  constructor() {
    this.hasFreshContent = true
  }

  // Recursively fetch all the tracks in a playlist
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


  // Recursively fetch all episodes in a podcast
  // Still TODO
  async _fetchAllPodcastEpisodes(showId) {
    const LIMIT = 50
    const load = async (offset = 0) => {
      const tracks = await spotify.getShowEpisodes(showId, {
        offset,
        limit: LIMIT,
        // fields: 'total, limit, items(added_at, track(name, uri, artists, album(name, images)))'
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
  }

  async cleanUp() {
    
  }
}