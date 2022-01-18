import moment from 'moment'
import Block from '../Block.js'

export default class BlockSpotifyTrack extends Block {
  constructor(playlistItem) {
    super()
    this.track = playlistItem.track
    this.addedAt = playlistItem.addedAt
  }

  get scanCodeUrl() {
    return `https://scannables.scdn.co/uri/plain/png/ffffff/black/640/${this.track.uri}`
  }

  get albumArtUrl() {
    const { url } = this.track.album.images.find(({ height }) => height > 64 && height < 640)
    return url
  }

  get artistNames() {
    return this.track.artists.map(({ name }) => name).join(', ')
  }

  // Render the current block to the canvas with
  // this.canvas, this.ctx, this.startPosY
  async render() {
    const [scanCode, albumArt] = await Promise.all([
      this._loadRemoteImage(this.scanCodeUrl),
      this._loadRemoteImage(this.albumArtUrl)
    ])

    // Draw album art and scan code
    this._drawDitheredImage(albumArt, 10, this.startPosY, 150, 150)
    this.ctx.drawImage(scanCode, 480 - 320, this.startPosY + 80, 320, 80)

    // Artist name
    this.ctx.font = "700 26px Montserrat"
    this.ctx.fillStyle = "black"
    this._fillTextFromTopLeft(this.artistNames, 180, this.startPosY)

    // Track name
    this.ctx.font = "500 24px Montserrat"
    this.ctx.fillStyle = "black"
    this._fillTextFromTopLeft(this.track.name, 180, this.startPosY + 40)

    return { endPosY: this.startPosY + 150 }
  }
}