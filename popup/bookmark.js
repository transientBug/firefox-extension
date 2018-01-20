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
  document.querySelector("#login-content").classList.remove("hidden")
}

function onLoginOpened(tab) {
  console.log("Goodluck")
  document.querySelector("#login-content").classList.add("hidden")
}

function startBookmarking() {
  document.querySelector("#loading-content").classList.remove("hidden")
  browser.tabs.query({active: true, currentWindow: true}).then(bookmarkTab)
}

function bookmarkTab(tabs) {
  let tab = tabs[0]
  console.log("Bookmarking tab", tab)

  let url = `http://localhost:3000/api/v1/bookmarks?auth_token=${this.result.email}:${this.result.apitoken}`
  let data = { url: tab.url, title: tab.title }

  let headers = new Headers({
    "Content-Type": "application/json"
  })

  let fetchParams = {
    method: "POST",
    body: JSON.stringify(data),
    headers: headers
  }

  fetch(url, fetchParams).then(onResponse).catch(onError)
}

function onResponse(response) {
  if(!response.ok) {
    debugger
    throw new TypeError(`Non-Okay response back from the server: ${response.status} - ${response.body}`)
  }

  let json = response.json()

  console.log("Success:", json)

  document.querySelector("#loading-content").classList.add("hidden")
  document.querySelector("#popup-content").classList.remove("hidden")
}

function setup() {
  browser.storage.local.get().then(onGetStorage, onError)

  document.addEventListener("click", (event) => buttonHandlers(event.target.id))
}

setup()
