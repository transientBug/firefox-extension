//const page_handlers = {
//  auth_data: (event) => {
//    browser.runtime.sendMessage(event.data)
//  }
//}

const extensionHandlers = {
  ack: (event) => {
    console.log("Extension authorized")
    //window.postMessage({
    //  sender: "content-script",
    //  type: "ack"
    //}, "*")
  }
}

//window.addEventListener("message", (event) => {
//  if (event.source == window &&
//      event.data &&
//      event.data.sender == "page-script") {
//    console.log("Got message from page script. Passing to extension background script", event)
//    page_handlers[event.data.type](event)
//  }
//})

browser.runtime.onMessage.addListener((event) => {
  console.log("Got message from background script. Passing to page script", event)
  extensionHandlers[event.type](event)
})

// Let the page script know we've loaded and are ready to get the auth_token
//window.postMessage({
//  sender: "content-script",
//  type: "handshake"
//}, "*")

let authData = Object.assign({}, document.querySelector("#authData").dataset)
if(authData) {
  browser.runtime.sendMessage({ type: "authData", payload: authData })
}
