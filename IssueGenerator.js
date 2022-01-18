import fs from 'fs'
import pIteration from 'p-iteration'
import Issue from './Issue.js'
import * as Blocks from './blocks/index.js'
import HeadlinesProvider from './providers/Headlines.js'
import MessagesProvider from './providers/Messages.js'
import QuoteProvider from './providers/Quote.js'
import WeatherProvider from './providers/Weather.js'
import SpotifyProvider from './providers/Spotify.js'
import InstagramProvider from './providers/Instagram.js'
import HttpClient from './HttpClient.js'
import Cloudflare from './CloudflareApi.js'
const { forEach } = pIteration

const TEMP_FILE = './issue.png'
const providers = [
  new HeadlinesProvider(),
  new MessagesProvider(),
  new QuoteProvider(),
  new WeatherProvider(),
  new SpotifyProvider(),
  new InstagramProvider(),
]

export default class IssueGenerator {
  constructor() {
    this.issue = null
    this.providers = null
  }

  // Fetch all the data to determine what blocks are needed
  async prepare() {
    // We also need to set some issue metadata like date & time, issue number
    // This should be stored in KV and updated
    const issueNo = 23
    const issuedAt = new Date()

    // Create the issue
    this.issue = new Issue({ issueNo, issuedAt })

    // Fetch the latest data from each of the providers
    await forEach(providers, async provider => {
      try {
        await provider.fetch()
      } catch (err) {
        console.log(`${provider.constructor.name}: Failed to fetch data`)
        console.log(err)
      }
    })

    const data = providers.filter(provider => provider.hasFreshContent)
    const blocks = [
      new Blocks.Header(),
      new Blocks.Spacer(40),
    ]

    // Loop through the data providers with fresh content and add required blocks
    for (let i = 0; i < data.length; i++) {
      const provider = data[i]
      console.log(`checking provider ${provider.constructor.name}`)

      switch (provider.constructor.name) {
        case 'HeadlinesProvider':
          blocks.push(new Blocks.Headlines())
          break

        // Print any unseen messages
        // Messages received between 23:00 and 07:00 aren't immediately printed as it's loud
        case 'MessagesProvider':
          // provider.data.forEach
          blocks.push(new Blocks.Message({ from: 'ben@ovalbit.com', date: new Date(), message: 'Hope you have a good day babe you look beautiful <3' }))
          break

        case 'QuoteProvider':
          blocks.push(new Blocks.PosterText('The bad news is time flies. The good news is you’re the pilot.'))
          break

        case 'WeatherProvider':
          blocks.push(new Blocks.Weather())
          break

        case 'SpotifyProvider':
          blocks.push(new Blocks.SpotifyHeader())

          // New playlist items
          if (provider.tracks.length) {
            blocks.push(new Blocks.Subheader('NEW IN YOUR PLAYLIST <3'))
            blocks.push(new Blocks.Spacer(15))
            provider.tracks.forEach((track, idx, arr) => {
              blocks.push(new Blocks.SpotifyTrack(track))
              blocks.push(new Blocks.Spacer(15))
              if (idx < arr.length - 1) {
                blocks.push(new Blocks.Divider('dashed'))
                blocks.push(new Blocks.Spacer(15))
              }
            })
          }

          // New podcast episodes
          // blocks.push(new Blocks.Subheader('FRESH PODCAST EPISODES'))
          // blocks.push(new Blocks.Spacer(15))
          // provider.tracks.forEach((track, idx, arr) => {
          //   blocks.push(new Blocks.SpotifyTrack(track))
          //   blocks.push(new Blocks.Spacer(15))
          //   if (idx < arr.length - 1) {
          //     blocks.push(new Blocks.Divider('dashed'))
          //     blocks.push(new Blocks.Spacer(15))
          //   }
          // })
          break

        case 'InstagramProvider':
          blocks.push(new Blocks.Photo({
            url: provider.latestPost.thumbnail_src,
            caption: provider.latestPost.edge_media_to_caption.edges[0].node.text,
          }))
          break
      }

      blocks.push(new Blocks.Spacer(40))
    }

    this.issue.addBlocks(...blocks)
    this.issue.addBlocks(new Blocks.Footer())

    // Save the providers used so data can be marked as printed at the end
    this.providers = data
  }

  // Run
  async run() {
    await this.prepare()
    const file = fs.createWriteStream(TEMP_FILE)
    const data = await this.issue.render()
    
    // Wait for file to be written
    await new Promise(r => {
      data.pipe(file)
      file.on('finish', () => r())
    })

    // // Upload 
    // const image = await this.upload()
    
    // // Save issue to KV
    // await this.cleanUp(image)

    // // Return URL to image
    // const [url] = image.variants
    // return { url }
  }

  // Upload the rendered issue
  async upload() {
    const file = fs.createReadStream(TEMP_FILE)
    const body = new FormData()
    body.append('file', file)

    const { result } = await Cloudflare.post('/images/v1', body)
    return result
  }

  // Mark data used as required
  async cleanUp(image) {
    // Clean up data from external providers
    await forEach(this.providers, provider => provider.cleanUp())
  }
}