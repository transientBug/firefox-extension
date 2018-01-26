// Handle setting the environment up based off of if we're installed in
// temporary mode or node
async function afterInstall(details) {
  //console.log("Extension installed", details)
  let data = {}

  if(details.temporary) {
    data = {
      env: "DEV",
      endpoint: "http://localhost:3000"
    }
  } else {
    data = {
      env: "PROD",
      endpoint: "https://transientbug.ninja"
    }
  }

  browser.storage.local.set(data)
}

browser.runtime.onInstalled.addListener(afterInstall)
