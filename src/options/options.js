const _form = document.querySelector("form")
const _devFields = document.getElementById("dev-only")

const _emailField = document.getElementById("email")
const _apitokenField = document.getElementById("apitoken")
const _endpointField = document.getElementById("endpoint")

function saveOptions(e) {
  e.preventDefault()

  browser.storage.local.set({
    email: _emailField.value,
    apitoken: _apitokenField.value,
    endpoint: _endpointField.value
  })
}

async function restoreOptions() {
  const result = await browser.storage.local.get()

  _emailField.value = result.email
  _apitokenField.value = result.apitoken
  _endpointField.value = result.endpoint

  if(result.env === "DEV")
    _devFields.classList.remove("hidden")
}

document.addEventListener("DOMContentLoaded", restoreOptions)
_form.addEventListener("submit", saveOptions)
