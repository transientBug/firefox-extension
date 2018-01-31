function extractCode(redirectUri) {
  const m = redirectUri.match(/[#?](.*)/)
  if (!m || m.length < 1)
    return null

  const params = new URLSearchParams(m[1].split("#")[0])
  return params.get("code")
}

async function login() {
  const {endpoint} = await browser.storage.local.get(["endpoint"])

  const redirectURL = browser.identity.getRedirectURL()

  const appId = "b8b95cef35956508fc34540ee0b990021d3b192cb32877947d040311b7e3ae26"
  const appSecret = "73c564b8cf9fa5a2f64e9b8105114691eaf59a96e7cdb5ab302477cf931f7d3d"

  const oauthEndpoint = `${endpoint}/oauth/authorize?client_id=${appId}&response_type=code&redirect_uri=${encodeURIComponent(redirectURL)}`

  const redirectedUrl = await browser.identity.launchWebAuthFlow({
    interactive: true,
    url: oauthEndpoint
  })

  console.log(redirectedUrl)

  const code = extractCode(redirectedUrl)

  const tokenEndpoint = `${endpoint}/oauth/token`

  const headers = new Headers({
    "Content-Type": "application/json",
    "Accept": "application/json"
  })

  const formData  = new FormData()

  formData.append("client_id", appId)
  formData.append("client_secret", appSecret)
  formData.append("redirect_uri", redirectURL)
  formData.append("grant_type", "authorization_code")
  formData.append("code", code)

  const fetchParams = {
    method: "POST",
    body: formData
  }

  debugger

  const response = await fetch(tokenEndpoint, fetchParams)

  debugger
}