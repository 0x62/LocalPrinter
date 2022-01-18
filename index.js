import 'dotenv/config'
import IssueGenerator from './IssueGenerator.js'

const generator = new IssueGenerator()
await generator.run()
