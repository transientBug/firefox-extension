function saveOptions(e) {
  e.preventDefault()

  browser.storage.local.set({
    email: document.querySelector("#email").value,
    apitoken: document.querySelector("#apitoken").value
  })
}

async function restoreOptions() {
  const result = await browser.storage.local.get()

  document.querySelector("#email").value = result.email
  document.querySelector("#apitoken").value = result.apitoken
}

document.addEventListener("DOMContentLoaded", restoreOptions)
document.querySelector("form").addEventListener("submit", saveOptions)
