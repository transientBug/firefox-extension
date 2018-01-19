const page_handlers = {
  auth_data: (event) => {
    browser.runtime.sendMessage(event.data)
  }
}

const extension_handlers = {
  ack: (event) => {
    window.postMessage({
      sender: "content-script",
      type: "ack"
    }, "*")
  }
}

window.addEventListener("message", (event) => {
  if (event.source == window &&
      event.data &&
      event.data.sender == "page-script") {
    console.log("Got message from page script. Passing to extension background script", event)
    page_handlers[event.data.type](event)
  }
})

browser.runtime.onMessage.addListener((event) => {
  console.log("Got message from background script. Passing to page script", event)
  extension_handlers[event.type](event)
})

// Let the page script know we've loaded and are ready to get the auth_token
window.postMessage({
  sender: "content-script",
  type: "handshake"
}, "*")
