async function getActiveTab() {
  const activeTabs = await browser.tabs.query({active: true, currentWindow: true})

  if(activeTabs.length < 1)
    throw new Error("No active tabs found!")

  const activeTab = activeTabs[0]

  return activeTab
}

// Enable and show the page action. Supposedly if you have a show_matches in
// the manifest, this isn't needed but that hasn't been working for me.
async function updateActiveTab() {
  const activeTab = await getActiveTab()

  //console.log("Window changed or updated, showing page action", activeTab)

  browser.pageAction.show(activeTab.id)
}

// listen to tab URL changes
browser.tabs.onUpdated.addListener(updateActiveTab)

// listen to tab switching
browser.tabs.onActivated.addListener(updateActiveTab)

// listen for window switching
browser.windows.onFocusChanged.addListener(updateActiveTab)

// update when the extension loads initially
updateActiveTab()

async function messageHandler(event) {
  //console.log("Got message from content script", event)

  browser.storage.local.set(event.payload)

  const activeTab = await getActiveTab()

  //console.log("Replying to content script with ack")
  browser.tabs.sendMessage(activeTab.id, {
    type: "ack"
  })
}

// Auth manager, listens for a message from the content script, which in turn
// received a message from the page script.
browser.runtime.onMessage.addListener(messageHandler)

// Handle setting the environment up based off of if we're installed in
// temporary mode or node
browser.runtime.onInstalled.addListener((details) => {
  //console.log("Extension installed", details)

  if(details.temporary) {
    //console.log("Setting endpoint to localhost")
    browser.storage.local.set({ endpoint: "http://localhost:3000" })
  } else {
    //console.log("Setting endpoint to production")
    browser.storage.local.set({ endpoint: "https://transientbug.ninja" })
  }
})
