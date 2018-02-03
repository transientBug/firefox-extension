const _logoutButton = document.getElementById("logout")


const _devFields = document.getElementById("dev-only")

const _redirectUrlField = document.getElementById("redirecturl")
const _appidField = document.getElementById("appid")
const _endpointField = document.getElementById("endpoint")


async function saveOptions(e) {
  e.preventDefault()

  const result = await browser.storage.local.get(["env"])

  if(result.env !== "DEV")
    return

  browser.storage.local.set({
    appid: _appidField.value,
    endpoint: _endpointField.value
  })
}

async function logout(e) {
  e.preventDefault()

  browser.storage.local.set({
    accesstoken: null
  })
}

async function restoreOptions() {
  const result = await browser.storage.local.get()

  if(result.env !== "DEV")
    return

  const redirectURL = browser.identity.getRedirectURL()

  _devFields.classList.remove("hidden")

  _redirectUrlField.value = redirectURL

  _endpointField.value = result.endpoint
  _appidField.value = result.appid

  Array.from(document.getElementsByTagName("input"))
    .forEach((el) => el.addEventListener("blur", saveOptions))
}


document.addEventListener("DOMContentLoaded", restoreOptions)
_logoutButton.addEventListener("click", logout)
