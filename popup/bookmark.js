function onError(error) {
  console.log(`Error ${error}`)
}

const buttonHandlers = {
  login: (event) => {
    browser.tabs.create({
      //url: "https://transientbug.ninja/extension-pair"
      url: "http://localhost:3000/profile?pairing=true"
    }).then(onLoginOpened, onError)
  }
}

function onGetStorage(result) {
  this.result = result

  if(!result.email || !result.apitoken) {
    requestLogin()
  } else {
    startBookmarking()
  }
}

function requestLogin() {
  console.log("Unauthed, requesting login with a button. yolo.")
  document.querySelector("#login-content").classList.remove("hidden")
}

function onLoginOpened(tab) {
  console.log("Starting auth process, goodluck")
  document.querySelector("#login-content").classList.add("hidden")
}

function startBookmarking() {
  console.log("Starting the bookmarking process")
  document.querySelector("#loading-content").classList.remove("hidden")
  browser.tabs.query({active: true, currentWindow: true}).then(bookmarkTab)
}

function bookmarkTab(tabs) {
  let tab = tabs[0]
  console.log("Sending bookmark request for active tab", tab)

  let url = `http://localhost:3000/api/v1/bookmarks?auth_token=${this.result.email}:${this.result.apitoken}`
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

  fetch(url, fetchParams).then(onResponse).catch(onError)
}

function onResponse(response) {
  console.log("Got response back from server", response)

  if(!response.ok) {
    throw new TypeError(`Non-Okay response back from the server: ${response.status}`)
  }

  let json = response.json()

  console.log("Response was a success", json)
  document.querySelector("#loading-content").classList.add("hidden")
  document.querySelector("#popup-content").classList.remove("hidden")
}

function setup() {
  browser.storage.local.get().then(onGetStorage, onError)

  document.addEventListener("click", (event) => buttonHandlers(event.target.id))
}

setup()
