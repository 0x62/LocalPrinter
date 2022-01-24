import { EventEmitter } from 'events'
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
import Storage from './Storage.js'
const { forEach } = pIteration

const messages = new MessagesProvider()
const storage = new Storage('db.json')

const providers = [
  messages,
  new HeadlinesProvider(),
  new QuoteProvider(),
  new WeatherProvider(),
  new SpotifyProvider(),
  new InstagramProvider(),
]

export default class IssueGenerator extends EventEmitter {
  constructor() {
    super()
    this.issue = null
    this.providers = []
  }

  async initialize() {
    if (!storage.initialized) {
      await storage.initialize()
    }

    providers.forEach(provider => {
      const { name } = provider.constructor
      storage.registerProvider(provider)
      
      // Providers are also realtime
      if (provider.REALTIME) {
        console.log(`[IssueGenerator] ${name} has real-time support`)
        provider.setup()
        provider.on('update', (msg) => {
          console.log(`[IssueGenerator] ${name} has fresh real-time content`)
          if (name === 'MessagesProvider') {
            this.createMessageIssue()
          }
        })
      }
    })
  }

  async update() {
    // Fetch the latest data from each of the providers
    await forEach(providers, this._updateProvider.bind(this))
  }

  async _updateProvider(provider) {
    try {
      // Realtime providers don't have a fetch function
      if (!provider.REALTIME) {
        await provider.fetch(this.issue)
      }
    } catch (err) {
      console.log(`[IssueGenerator.${provider._idPrefix}] Failed to fetch data`)
      console.log(err)
    }
  }

  // Create a mini issue just to print out the message block
  async createMessageIssue() {
    // Create the issue
    this.issue = new Issue({ updateOnly: true })
    this.providers = [messages]

    const blocks = [new Blocks.Spacer(20)]
    const { newMessages } = messages.data

    newMessages.forEach((message, idx) => {
      if (message.photo) {
        blocks.push(new Blocks.Photo({ url: message.photo }))
      } else {
        blocks.push(new Blocks.Message(message))
      }
      blocks.push(new Blocks.Spacer(20))
    })

    this.issue.addBlocks(...blocks)
    
    await this.renderToFile()
    await this.cleanUp()
  }

  async createUpdateIssue() {
    console.log(`[IssueGenerator] Creating update issue`)
    // We also need to set some issue metadata like date & time, issue number
    // This should be stored in KV and updated
    const issueNo = 23
    const issuedAt = new Date()

    // Create the issue
    this.issue = new Issue({ issueNo, issuedAt, updateOnly: true })

    await this.update()

    // Save providers for later use
    this.providers = providers.filter(prv => prv.hasFreshContent)
    // No fresh content, end without generating
    if (this.providers.length === 0) {
      console.log(`[IssueGenerator] No providers have fresh content, exiting`)
      return
    }

    const blocks = this._createBlocks(this.providers)
    this.issue.addBlocks(...blocks)

    await this.renderToFile()
    await this.cleanUp()
  }

  async createIssue() {
    console.log(`[IssueGenerator] Creating issue`)

    // We also need to set some issue metadata like date & time, issue number
    // This should be stored in KV and updated
    const issueNo = 23
    const issuedAt = new Date()

    // Create the issue
    this.issue = new Issue({ issueNo, issuedAt })

    await this.update()

    // Save providers for later use
    this.providers = providers.filter(prv => prv.hasContent)
    // No content, end now
    if (this.providers.length === 0) {
      console.log(`[IssueGenerator] No providers have content, exiting`)
      return
    }

    const blocks = this._createBlocks(this.providers)
    this.issue.addBlocks(...blocks)

    await this.renderToFile()
    await this.cleanUp()
  }

  async renderToFile() {
    const TEMP_FILE = 'output/issue.png'
    const file = fs.createWriteStream(TEMP_FILE)
    const data = await this.issue.render()
    
    // Wait for file to be written
    await new Promise(r => {
      data.pipe(file)
      file.on('finish', () => r())
    })

    this.emit('print')
    console.log(`[IssueGenerator] Export complete`)
  }

  _createBlocks(providers) {
    const blocks = [
      new Blocks.Header(),
      new Blocks.Spacer(40),
    ]

    // Loop through the data providers with fresh content and add required blocks
    for (let i = 0; i < providers.length; i++) {
      const provider = providers[i]
      const startLen = blocks.length

      switch (provider._idPrefix) {
        case 'HeadlinesProvider':
          blocks.push(new Blocks.Headlines())
          break

        // Print any unseen messages
        // Messages received between 23:00 and 07:00 aren't immediately printed as it's loud
        case 'MessagesProvider':
          const { messages, newMessages } = provider.data
          if (this.issue.updateOnly) {
            // Update shows all unseen messages
            newMessages.forEach((message, idx) => {
              blocks.push(new Blocks.Message(message))
              if (idx < newMessages.length - 1) {
                blocks.push(new Blocks.Spacer(15))
              }
            })
          } else {
            // Regular issue shows the last message received
            blocks.push(new Blocks.Message(messages[0]))
          }
          break

        case 'QuoteProvider':
          blocks.push(new Blocks.PosterText('The bad news is time flies. The good news is you’re the pilot.'))
          break

        case 'WeatherProvider':
          blocks.push(new Blocks.Weather())
          break

        case 'SpotifyProvider':
          blocks.push(new Blocks.SpotifyHeader())

          const { tracks, newTracks } = provider.data
          if (this.issue.updateOnly) {
            // If update shows the new music for the day
            blocks.push(new Blocks.Subheader('NEW MUSIC FOR TODAY <3'))
            blocks.push(new Blocks.Spacer(15))
            newTracks.forEach((track, idx, arr) => {
              blocks.push(new Blocks.SpotifyTrack(track))
              blocks.push(new Blocks.Spacer(15))
              blocks.push(new Blocks.Divider('dashed'))
              if (idx < arr.length - 1) {
                blocks.push(new Blocks.Spacer(15))
              }
            })
          } else {
            // Otherwise shows the latest 5 added
            blocks.push(new Blocks.Subheader('RECENTLY ADDED TO PLAYLIST'))
            blocks.push(new Blocks.Spacer(15))
            tracks.forEach((track, idx, arr) => {
              blocks.push(new Blocks.SpotifyTrack(track))
              blocks.push(new Blocks.Spacer(15))
              blocks.push(new Blocks.Divider('dashed'))
              if (idx < arr.length - 1) {
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
          blocks.push(new Blocks.Photo(provider.data.latestPost))
          break
      }

      const newBlocks = blocks.slice(-blocks.length - startLen).map(block => block.constructor.name)
      console.log(`[IssueGenerator.${provider._idPrefix}] Added ${newBlocks.join(', ')}`)

      blocks.push(new Blocks.Spacer(40))
    }

    blocks.push(new Blocks.Footer())
    return blocks
  }

  // Mark data used as required
  async cleanUp() {
    // Clean up data from external providers
    await forEach(this.providers, provider => {
      provider.cleanUp()
    })
    // Save state
    await storage.write()
  }
}