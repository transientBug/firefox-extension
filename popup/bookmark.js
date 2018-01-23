const buttonHandlers = {
  login: (resultOfGet, event) => {
    browser.tabs.create({
      url: `${resultOfGet.endpoint}/profile?pairing=true`
    }).then(onLoginOpened)
  }
}

function onLoginOpened(tab) {
  console.log("Starting auth process, goodluck")
  document.querySelector("#login-content").classList.add("hidden")
}

async function tabs() {
  let settings = await browser.storage.local.get()

  if(!settings.email || !settings.apitoken) {
    console.log("Unauthed, requesting login with a button. yolo.")
    document.addEventListener("click", (event) => buttonHandlers[event.target.id](settings, event))

    document.querySelector("#login-content").classList.remove("hidden")

    return
  }

  let activeTabs = await browser.tabs.query({active: true, currentWindow: true})

  console.log("Starting the bookmarking process")

  document.querySelector("#loading-content").classList.remove("hidden")

  let tab = activeTabs[0]

  console.log("Sending bookmark request for active tab", tab)

  let url = `${settings.endpoint}/api/v1/bookmarks?auth_token=${settings.email}:${settings.apitoken}`

  let data = {
    data: {
      type: "bookmark",
      attributes: {
        url: tab.url,
        title: tab.title
      }
    }
  }

  let headers = new Headers({
    "Content-Type": "application/vnd.api+json",
    "Accept": "application/vnd.api+json"
  })

  let fetchParams = {
    method: "POST",
    body: JSON.stringify(data),
    headers: headers
  }

  console.log(`Sending to ${url}`, fetchParams)

  let response = await fetch(url, fetchParams)

  console.log("Got response back from server", response)

  if(!response.ok) {
    throw new TypeError(`Non-Okay response back from the server: ${response.status}`)
  }

  let json = await response.json()

  console.log("Response was a success", json)

  browser.pageAction.setIcon({
    tabId: tab.id, path: "icons/ic_bookmark_black_24dp_2x.png"
  })

  document.querySelector("#loading-content").classList.add("hidden")
  document.querySelector("#popup-content").classList.remove("hidden")

  // Setup handling of unfocus events on the form to update the bookmark
}

tabs()
