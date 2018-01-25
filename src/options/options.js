function saveOptions(e) {
  e.preventDefault()

  browser.storage.local.set({
    email: document.querySelector("#email").value,
    apitoken: document.querySelector("#apitoken").value
  })
}

function restoreOptions() {
  function onGot(result) {
    document.querySelector("#email").value = result.email
    document.querySelector("#apitoken").value = result.apitoken
  }

  function onError(error) {
    console.log(`Error: ${error}`)
  }

  let gettingItem = browser.storage.local.get()
  gettingItem.then(onGot, onError)
}

document.addEventListener("DOMContentLoaded", restoreOptions)
document.querySelector("form").addEventListener("submit", saveOptions)
