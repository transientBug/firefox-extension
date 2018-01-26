const authData = Object.assign({}, document.querySelector("#authData").dataset)

if(authData) {
  browser.runtime.sendMessage({ type: "authData", payload: authData })
}
