const APP_ID = "755999239a453f73ab1108d0b94e194e3f54b51255283877f56ce6917e7f8995"

// Handle setting the environment up based off of if we're installed in
// temporary mode or node
async function afterInstall(details) {
  //console.log("Extension installed", details)
  const data = {
    appid: APP_ID
  }

  if(details.temporary) {
    Object.assign(data, {
      env: "DEV",
      endpoint: "http://localhost:3000",
      access_token: ""
    })

    //const redirectURL = browser.identity.getRedirectURL()
    //console.log(`Redirect URL ${redirectURL}`)
  } else {
    Object.assign(data, {
      env: "PROD",
      endpoint: "https://transientbug.ninja"
    })
  }

  browser.storage.local.set(data)
}

browser.runtime.onInstalled.addListener(afterInstall)
