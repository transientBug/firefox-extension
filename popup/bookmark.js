const BOOKMARK_ICON_OUTLINE = "icons/ic_bookmark_border_black_24dp_2x.png"
const BOOKMARK_ICON_FILL    = "icons/ic_bookmark_black_24dp_2x.png"


const App = {
  _currentPanel: null,
  _previousPanel: null,
  _panels: {},

  async currentTab() {
    const tabs = await browser.tabs.query({active: true, windowId: browser.windows.WINDOW_ID_CURRENT})

    if(tabs.length < 1)
      throw new Error("No active tabs found, can't bookmark anything!")

    return tabs[0]
  },

  async getSettings(...values) {
    const settings = await browser.storage.local.get([...values])
    return settings
  },

  async showPanel(panel, ...args) {
    // Invalid panel... ?!?
    if(!(panel in this._panels)) {
      throw new Error("Something really bad happened. Unknown panel: " + panel)
    }

    this._previousPanel = this._currentPanel
    this._currentPanel = panel

    const panelObject = this._panels[panel]

    // Initialize the panel before showing it.
    if("prepare" in panelObject)
      await panelObject.prepare(...args)

    Object.keys(this._panels).forEach((panelKey) => {
      const panelItem = this._panels[panelKey]

      const panelElement = document.querySelector(panelItem.panelSelector)

      if(!panelElement.classList.contains("hidden")) {
        panelElement.classList.add("hidden")

        if("unregister" in panelItem)
          panelItem.unregister()
      }
    })

    document.querySelector(panelObject.panelSelector).classList.remove("hidden")

    if("run" in panelObject)
      panelObject.run()
  },

  showPreviousPanel(...args) {
    if(!this._previousPanel) {
      throw new Error("Current panel not set!")
    }

    this.showPanel(this._previousPanel, ...args)
  },

  registerPanel(panelName, panelObject) {
    this._panels[panelName] = panelObject

    if("initialize" in panelObject)
      panelObject.initialize()
  },

  async changeIcon(icon) {
    const activeTab = await this.currentTab()

    browser.pageAction.setIcon({
      tabId: activeTab.id,
      path: icon
    })
  },

  addEnterHandler(element, handler) {
    element.addEventListener("click", (e) => {
      handler(e)
    })

    element.addEventListener("keydown", (e) => {
      if(e.keyCode === 13) {
        e.preventDefault()
        handler(e)
      }
    })
  },

  async init() {
    const {email, apitoken} = await App.getSettings("email", "apitoken")

    if(!email || !apitoken) {
      this.showPanel(P_LOGIN)
    } else {
      this.showPanel(P_SAVING)
    }
  }
}


const P_LOGIN = "login"
const P_SAVING = "saving"
const P_DETAILS = "details"
const P_ERROR = "error"


App.registerPanel(P_LOGIN, {
  panelSelector: ".login-panel",

  // This method is called when the object is registered.
  async initialize() {
    const {endpoint} = await App.getSettings("endpoint")

    console.log(endpoint)

    App.addEnterHandler(document.querySelector(".login-button"), async function () {
      await browser.tabs.create({
        url: `${endpoint}/profile?pairing=true`
      })

      console.log("Opening profile page to grab api token")

      window.close()
    })
  },

  // This method is called when the panel is about to be shown.
  prepare() {
    console.log("Unauthed, requesting login with a button. yolo.")

    return Promise.resolve(null)
  },

  // This method is called after the panel is shown
  run() {
    return Promise.resolve(null)
  },

  // This method is called when the panel is hidden
  unregister() {
    return Promise.resolve(null)
  }
})


App.registerPanel(P_SAVING, {
  panelSelector: ".saving-panel",

  async url() {
    const {endpoint, email, apitoken} = await App.getSettings("endpoint", "email", "apitoken")

    return `${endpoint}/api/v1/bookmarks?auth_token=${email}:${apitoken}`
  },

  // This method is called when the object is registered.
  initialize() {
    return Promise.resolve(null)
  },

  // This method is called when the panel is about to be shown.
  prepare() {
    return Promise.resolve(null)
  },

  // This method is called after the panel is shown
  async run() {
    const activeTab = await App.currentTab()
    const url = await this.url()

    console.log("Sending bookmark request for active tab", activeTab)

    const data = {
      data: {
        type: "bookmark",
        attributes: {
          url: activeTab.url,
          title: activeTab.title
        }
      }
    }

    const headers = new Headers({
      "Content-Type": "application/vnd.api+json",
      "Accept": "application/vnd.api+json"
    })

    const fetchParams = {
      method: "POST",
      headers: headers,
      body: JSON.stringify(data)
    }

    console.log(`Sending to ${url}`, fetchParams)

    const response = await fetch(url, fetchParams)

    console.log("Got response back from server", response)

    if(!response.ok) {
      throw new TypeError(`Non-Okay response back from the server: ${response.status}`)
    }

    const json = await response.json()

    // Do stuff with the JSON

    App.changeIcon(BOOKMARK_ICON_FILL)

    App.showPanel(P_DETAILS)
  },

  // This method is called when the panel is hidden
  unregister() {
    return Promise.resolve(null)
  }
})


App.registerPanel(P_DETAILS, {
  panelSelector: ".details-panel",

  // This method is called when the object is registered.
  initialize() {
    return Promise.resolve(null)
  },

  // This method is called when the panel is about to be shown.
  prepare() {
    return Promise.resolve(null)
  },

  // This method is called after the panel is shown
  run() {
    return Promise.resolve(null)
  },

  // This method is called when the panel is hidden
  unregister() {
    return Promise.resolve(null)
  }
})


App.registerPanel(P_ERROR, {
  panelSelector: ".error-panel",

  // This method is called when the object is registered.
  initialize() {
    return Promise.resolve(null)
  },

  // This method is called when the panel is about to be shown.
  prepare(error) {
    console.log(error)

    const errorMessage = document.getElementById("error-message")

    errorMessage.innerText = error.message

    return Promise.resolve(null)
  },

  // This method is called after the panel is shown
  run() {
    return Promise.resolve(null)
  },

  // This method is called when the panel is hidden
  unregister() {
    return Promise.resolve(null)
  }
})


App.init().catch((error) => App.showPanel(P_ERROR, error))
