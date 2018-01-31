const _devFields = document.getElementById("dev-only")

const _emailField = document.getElementById("email")
const _apitokenField = document.getElementById("apitoken")

const _endpointField = document.getElementById("endpoint")

async function saveOptions(e) {
  e.preventDefault()

  const result = await browser.storage.local.get(["env"])

  browser.storage.local.set({
    email: _emailField.value,
    apitoken: _apitokenField.value
  })

  if(result.env === "DEV") {
    browser.storage.local.set({
      endpoint: _endpointField.value
    })
  }
}

async function restoreOptions() {
  const result = await browser.storage.local.get()

  _emailField.value = result.email
  _apitokenField.value = result.apitoken

  _emailField.addEventListener("blur", saveOptions)
  _apitokenField.addEventListener("blur", saveOptions)

  if(result.env === "DEV") {
    _devFields.classList.remove("hidden")

    _endpointField.value = result.endpoint
    _endpointField.addEventListener("blur", saveOptions)
  }
}

document.addEventListener("DOMContentLoaded", restoreOptions)
