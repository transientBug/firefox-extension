function extractAcccessToken(redirectUri) {
  const m = redirectUri.match(/[#?](.*)/)
  if (!m || m.length < 1)
    return null

  const params = new URLSearchParams(m[1].split("#")[0])
  return params.get("access_token")
}

// eslint-disable-next-line no-unused-vars
async function login() {
  const {endpoint, appid} = await browser.storage.local.get(["endpoint", "appid"])
  const redirectURL = encodeURIComponent(browser.identity.getRedirectURL())

  const oauthEndpoint = `${endpoint}/oauth/authorize?client_id=${appid}&redirect_uri=${redirectURL}&response_type=token`

  const redirectedUrl = await browser.identity.launchWebAuthFlow({
    interactive: true,
    url: oauthEndpoint
  })

  //console.log(redirectedUrl)

  const access_token = extractAcccessToken(redirectedUrl)

  browser.storage.local.set({"access_token": access_token})
}
