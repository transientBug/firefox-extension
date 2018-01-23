// Enable and show the page action. Supposedly if you have a show_matches in
// the manifest, this isn't needed but that hasn't been working for me.
async function updateActiveTab(tabs) {
  let activeTabs = await browser.tabs.query({active: true, currentWindow: true})
  let activeTab = activeTabs[0]

  console.log("Window changed or updated, showing page action")

  await browser.pageAction.show(activeTab.id)
}

// Enable and show the page action. Supposedly if you have a show_matches in
// the manifest, this isn't needed but that hasn't been working for me.
async function updateTab(tabs) {
  let activeTabs = await browser.tabs.query({active: true, currentWindow: true})
  let activeTab = activeTabs[0]
  let settings = await browser.storage.local.get()

  console.log("Tab changed or updated, showing page action")

  await browser.pageAction.show(activeTab.id)

  if(!settings.email || !settings.apitoken)
    return

  let url = `${settings.endpoint}/api/v1/bookmarks/check?auth_token=${settings.email}:${settings.apitoken}&url=${activeTab.url}`

  let headers = new Headers({
    "Content-Type": "application/vnd.api+json",
    "Accept": "application/vnd.api+json"
  })

  let fetchParams = {
    method: "GET",
    headers: headers
  }

  console.log("Checking if bookmark exists for tab", activeTab)
  let response = await fetch(url, fetchParams)

  if(response.status == 302) {
    console.log("Bookmark exists for tab", activeTab)
  } else {
    console.log("Bookmark does not exist for tab", activeTab)
  }
}

// listen to tab URL changes
browser.tabs.onUpdated.addListener(updateTab)

// listen to tab switching
browser.tabs.onActivated.addListener(updateTab)

// listen for window switching
browser.windows.onFocusChanged.addListener(updateActiveTab)

// update when the extension loads initially
updateActiveTab()


const handlers = {
  authData: (event) => {
    browser.storage.local.set(event.payload)

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

  if(details.temporary) {
    console.log("Setting endpoint to localhost")
    browser.storage.local.set({ endpoint: "http://localhost:3000" })
  } else {
    console.log("Setting endpoint to production")
    browser.storage.local.set({ endpoint: "https://transientbug.ninja" })
  }
})
