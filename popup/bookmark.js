function onError(error) {
  console.log(`Error ${error}`)
}

function onGot(result) {
  function onCreated(tab) {
    console.log("Goodluck")
    document.querySelector("#login-content").classList.add("hidden")
  }

  if(!result.email || !result.apitoken) {
    document.querySelector("#login-content").classList.remove("hidden")
    document.addEventListener("click", (event) => {
      if(event.target.id == "login") {
        browser.tabs.create({
          //url: "https://transientbug.ninja/extension-pair"
          url: "http://localhost:3000/profile?pairing=true"
        }).then(onCreated, onError)
      }
    })
  } else {
    document.querySelector("#loading-content").classList.remove("hidden")
    // TODO: dispatch request with title and all other info

    browser.tabs.query({active: true, currentWindow: true}).then((tabs) => {
      let tab = tabs[0]
      console.log("Bookmarking tab", tab)

      let url = `http://localhost:3000/api/v1/bookmarks?auth_token=${result.email}:${result.apitoken}`
      let data = { url: tab.url, title: tab.title }

      fetch(url, {
        method: "POST",
        body: JSON.stringify(data),
        headers: new Headers({
          "Content-Type": "application/json"
        })
      }).then(res => res.json())
      .then((response) => {
        console.log("Success:", response)
        document.querySelector("#loading-content").classList.add("hidden")
        document.querySelector("#popup-content").classList.remove("hidden")
      })
      .catch(error => console.error("Error:", error))
    })
  }
}

browser.storage.local.get().then(onGot, onError)
