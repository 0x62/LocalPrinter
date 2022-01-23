import SpotifyClient from 'spotify-web-api-node'
import Provider from '../Provider.js'

const spotify = new SpotifyClient({
  clientId: process.env.SPOTIFY_CLIENT_ID,
  clientSecret: process.env.SPOTIFY_SECRET
})

// Fetch songs added to a playlist for wendy, if not seen before then print
export default class SpotifyProvider extends Provider {
  constructor() {
    super()
    this.showsToTrack = [
      '488Ctw9jVD7jwwo7vPET14', // Happy Hour
      '7iQXmUT7XGuZSzAMjoNWlX', // Diary of a CEO
      '0ofXAdFIQQRsCYj9754UFx', // Stuff you should know
      '5aOLuPenneHbhLh05fmkeu', // I Spent a Day With
      '43q5OD7x3cPKx21DnupCks', // Dark History (seems to be sorted earliest first?)
      '3HMLJYY1FQQrtY20iAQ7M5', // Mile Higher
      '7i4OI4Oi7kym2fSauBukJp', // Eckhart Tolle: Essential Teachings (also sorted weird)
    ]
  }

  get hasFreshContent() {
    const { newTracks } = this.data
    return newTracks && newTracks.length > 0
  }

  get hasContent() {
    const { tracks } = this.data
    return tracks && tracks.length > 0
  }

  // Recursively fetch all the tracks in a playlist
  async _fetchAllPlaylistTracks() {
    const LIMIT = 50
    const load = async (offset = 0) => {
      try {
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
      } catch (err) {
        console.log(`[SpotifyProvider] status=${err.body.error.status} message=${err.body.error.message}`)
        return []
      }
    }

    return load()
  }


  // Recursively fetch all episodes in a podcast
  // Still TODO
  // async _fetchPodcastEpisodes(showId) {
  //   try {
  //     const episodes = await spotify.getShowEpisodes(showId, {
  //       offset: 0,
  //       limit: 50,
  //     })

  //     return episodes.body.items
  //   } catch (err) {
  //     console.log(`[SpotifyProvider] status=${err.body.error.status} message=${err.body.error.message}`)
  //     return []
  //   }
  // }

  async fetch({ updateOnly }) {
    const auth = await spotify.clientCredentialsGrant()
    spotify.setAccessToken(auth.body.access_token)

    let [tracks, ...podcasts] = await Promise.all([
      this._fetchAllPlaylistTracks(),
      // this._fetchPodcastEpisodes(this.showsToTrack[0])
    ])

    let newTracks = this.filterSeenItems(tracks, ({ track }) => track.uri)

    // If running an update operation save the seen Ids
    if (updateOnly) {
      // Only mark the most recent 3 tracks as updated, save the rest for next update issue
      newTracks = newTracks.slice(-3)
      this.markSeenOnCleanUp(newTracks, ({ track }) => track.uri)
    } else {
      // Only show the most recent three tracks
      tracks = tracks
        .sort((a, b) => new Date(b.added_at) - new Date(a.added_at))
        .slice(0, 3)

      // Also mark these as seen so they don't come up tomorrow
      this.markSeenOnCleanUp(tracks, ({ track }) => track.uri)
    }

    this.data = {
      tracks,
      newTracks,
    }
  }
}