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
