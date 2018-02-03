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
  let redirectUrl = encodeURIComponent(browser.identity.getRedirectURL())

  const oauthEndpoint = `${endpoint}/oauth/authorize?client_id=${appid}&redirect_uri=${redirectUrl}&response_type=token`

  redirectUrl = await browser.identity.launchWebAuthFlow({
    interactive: true,
    url: oauthEndpoint
  })

  const access_token = extractAcccessToken(redirectUrl)

  browser.storage.local.set({"access_token": access_token})
}
