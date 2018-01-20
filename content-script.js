const extensionHandlers = {
  ack: (event) => {
    console.log("Extension authorized")
  }
}

browser.runtime.onMessage.addListener((event) => {
  console.log("Got message from background script. Passing to page script", event)
  extensionHandlers[event.type](event)
})

let authData = Object.assign({}, document.querySelector("#authData").dataset)
if(authData) {
  browser.runtime.sendMessage({ type: "authData", payload: authData })
}
