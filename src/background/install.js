const APP_ID = "cad18a8d91f3675493058223c0dbf3905de1d8c38b23fad22391f53156d44827"

// Handle setting the environment up based off of if we're installed in
// temporary mode or node
async function afterInstall(details) {
  //console.log("Extension installed", details)
  let data = {
    appid: APP_ID
  }

  if(details.temporary) {
    data = {
      env: "DEV",
      endpoint: "http://localhost:3000",
      access_token: ""
    }

    //const redirectURL = browser.identity.getRedirectURL()
    //console.log(`Redirect URL ${redirectURL}`)
  } else {
    data = {
      env: "PROD",
      endpoint: "https://transientbug.ninja"
    }
  }

  browser.storage.local.set(data)
}

browser.runtime.onInstalled.addListener(afterInstall)
