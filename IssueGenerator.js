import fs from 'fs'
import pIteration from 'p-iteration'
import Issue from './Issue.js'
import * as Blocks from './blocks/index.js'
import HeadlinesProvider from './providers/Headlines.js'
import MessagesProvider from './providers/Messages.js'
import QuoteProvider from './providers/Quote.js'
import WeatherProvider from './providers/Weather.js'
import SpotifyProvider from './providers/Spotify.js'
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
          blocks.push(new Blocks.Message({ from: 'ben@ovalbit.com', at: new Date(), contents: 'Hello world' }))
          break

        case 'QuoteProvider':
          blocks.push(new Blocks.PosterText('The bad news is time flies. The good news is you’re the pilot.'))
          break

        case 'WeatherProvider':
          blocks.push(new Blocks.Weather())
          break

        case 'SpotifyProvider':
          blocks.push(new Blocks.SpotifyHeader())
          provider.tracks.forEach((track, idx) => {
            blocks.push(new Blocks.SpotifyTrack(track))
            blocks.push(new Blocks.Spacer(30))
          })
          break
      }
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