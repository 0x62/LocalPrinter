export default class HttpClient {
  constructor(options = {}) {
    this._baseUrl = options.baseUrl || ""
    this._headers = options.headers || {}
    this._qs = options.qs || {}
  }

  async _fetchJSON(endpoint, options = {}) {
    const qs = new URLSearchParams({
      ...this._qs,
      ...(options.qs || {})
    }).toString()

    const path = [this._baseUrl, endpoint, qs.length ? `?${qs}` : ''].join('')
    const res = await fetch(path, {
      ...options,
      headers: this._headers
    })

    if (!res.ok) throw new Error(res.statusText)

    if (options.parseResponse !== false && res.status !== 204)
      return res.json()

    return undefined
  }

  setHeader(key, value) {
    this._headers[key] = value
    return this
  }

  getHeader(key) {
    return this._headers[key]
  }

  setBasicAuth(username, password) {
    this._headers.Authorization = `Basic ${btoa(`${username}:${password}`)}`
    return this
  }

  setBearerAuth(token) {
    this._headers.Authorization = `Bearer ${token}`
    return this
  }

  get(endpoint, options = {}) {
    return this._fetchJSON(endpoint, {
      ...options,
      method: "GET"
    })
  }

  post(endpoint, body, options = {}) {
    let _body = undefined
    if (body && body instanceof FormData) {
      _body = body
    } else if (body) {
      _body = JSON.stringify(body)
    }

    return this._fetchJSON(endpoint, {
      ...options,
      body: _body,
      method: "POST"
    })
  }

  put(endpoint, body, options = {}) {
    return this._fetchJSON(endpoint, {
      ...options,
      body: body ? JSON.stringify(body) : undefined,
      method: "PUT"
    })
  }

  patch(endpoint, operations, options = {}) {
    return this._fetchJSON(endpoint, {
      parseResponse: false,
      ...options,
      body: JSON.stringify(operations),
      method: "PATCH"
    })
  }

  delete(endpoint, options = {}) {
    return this._fetchJSON(endpoint, {
      parseResponse: false,
      ...options,
      method: "DELETE"
    })
  }
}
