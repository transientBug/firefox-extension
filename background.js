// Enable and show the page action. Supposedly if you have a show_matches in
// the manifest, this isn't needed but that hasn't been working for me.
function updateActiveTab(tabs) {
  browser.tabs.query({active: true, currentWindow: true})
    .then((tabs) => {
      browser.pageAction.show(tabs[0].id);
    })
}

// listen to tab URL changes
browser.tabs.onUpdated.addListener(updateActiveTab)

// listen to tab switching
browser.tabs.onActivated.addListener(updateActiveTab)

// listen for window switching
browser.windows.onFocusChanged.addListener(updateActiveTab)

// update when the extension loads initially
updateActiveTab()


const handlers = {
  auth_data: (event) => {
    let message = event.message

    browser.storage.local.set({
      email: message.email,
      authToken: message.authToken
    })

    console.log("Replying to content script with ack")
    browser.tabs.query({active: true, currentWindow: true}) .then((tabs) => {
      browser.tabs.sendMessage(tabs[0].id, {
        type: "ack"
      })
    })
  }
}

// Auth manager, listens for a message from the content script, which in turn
// recieved a message from the page script.
browser.runtime.onMessage.addListener((event) => {
  console.log("Got message from content script", event)
  handlers[event.type](event)
})


// Handle setting the environment up based off of if we're installed in
// temporary mode or node
browser.runtime.onInstalled.addListener((details) => {
  console.log("Extension installed", details)
})
