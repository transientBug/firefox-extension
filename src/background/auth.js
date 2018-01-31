const APP_ID = "cad18a8d91f3675493058223c0dbf3905de1d8c38b23fad22391f53156d44827"

function extractAcccessToken(redirectUri) {
  const m = redirectUri.match(/[#?](.*)/)
  if (!m || m.length < 1)
    return null

  const params = new URLSearchParams(m[1].split("#")[0])
  return params.get("access_token")
}

async function login() {
  const {endpoint} = await browser.storage.local.get(["endpoint"])

  const redirectURL = encodeURIComponent(browser.identity.getRedirectURL())

  const oauthEndpoint = `${endpoint}/oauth/authorize?client_id=${APP_ID}&redirect_uri=${redirectURL}&response_type=token`

  const redirectedUrl = await browser.identity.launchWebAuthFlow({
    interactive: true,
    url: oauthEndpoint
  })

  //console.log(redirectedUrl)

  const access_token = extractAcccessToken(redirectedUrl)

  browser.storage.local.set({"access_token": access_token})
}
