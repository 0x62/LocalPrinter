import HttpClient from './HttpClient.js'

// Replace with env in wrangler
const CF_ACCOUNT_ID = ''
const CF_TOKEN = ''

export default new HttpClient({
  baseUrl: `https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT_ID}`,
  headers: {
    'Authorization': `Bearer ${CF_TOKEN}`,
  }
})