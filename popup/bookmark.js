function onError(error) {
  console.log(`Error ${error}`)
}

function onGot(result) {
  function onCreated(tab) {
    console.log("Goodluck")
    document.querySelector("#login-content").classList.add("hidden")
  }

  if(!result.email || !result.authToken) {
    document.querySelector("#login-content").classList.remove("hidden")
    document.addEventListener("click", (event) => {
      if(event.target.id == "login") {
        browser.tabs.create({
          //url: "https://transientbug.ninja/extension-pair"
          url: "http://localhost:3000/extension-pair"
        }).then(onCreated, onError)
      }
    })
  } else {
    document.querySelector("#loading-content").classList.remove("hidden")
    // TODO: dispatch request with title and all other info

    browser.tabs.query({active: true, currentWindow: true}).then((tabs) => {
      let tab = tabs[0]
      console.log("Bookmarking tab", tab)
    })
  }
}

browser.storage.local.get().then(onGot, onError)
