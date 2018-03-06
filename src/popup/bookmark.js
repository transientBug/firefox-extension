//const BOOKMARK_ICON_OUTLINE = "../icons/ic_bookmark_border_black_24dp_2x.png"
const BOOKMARK_ICON_FILL    = "../icons/ic_bookmark_black_24dp_2x.png"


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

  async setSettings(values) {
    await browser.storage.local.set(values)
  },

  async changeIcon(icon) {
    const activeTab = await this.currentTab()

    browser.pageAction.setIcon({ tabId: activeTab.id, path: icon })
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

  registerPanel(panelName, panelObject) {
    this._panels[panelName] = panelObject

    if("initialize" in panelObject)
      panelObject.initialize()
  },

  showPreviousPanel(...args) {
    if(!this._previousPanel)
      throw new Error("Current panel not set!")

    this.showPanel(this._previousPanel, ...args)
  },

  hideAllPanels() {
    Object.keys(this._panels).forEach((panelKey) => {
      const panelItem = this._panels[panelKey]

      const panelElement = document.querySelector(panelItem.panelSelector)

      if(!panelElement.classList.contains("hidden")) {
        panelElement.classList.add("hidden")

        if("unregister" in panelItem)
          panelItem.unregister()
      }
    })
  },

  async showPanel(panel, ...args) {
    // Invalid panel... ?!?
    if(!(panel in this._panels))
      throw new Error("Something really bad happened. Unknown panel: " + panel)

    this._previousPanel = this._currentPanel
    this._currentPanel = panel

    const panelObject = this._panels[panel]

    // Initialize the panel before showing it.
    if("prepare" in panelObject)
      await panelObject.prepare(...args)

    this.hideAllPanels()

    document.querySelector(panelObject.panelSelector).classList.remove("hidden")

    if("run" in panelObject)
      panelObject.run()
  },

  async init() {
    const {access_token} = await App.getSettings("access_token")

    if(!access_token) {
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

  _button: document.querySelector(".login-button"),

  async loginButtonHandler() {
    const page = browser.extension.getBackgroundPage()
    page.login()

    window.close()
  },

  // This method is called when the object is registered.
  async initialize() {
    App.addEnterHandler(this._button, this.loginButtonHandler)
  }
})


App.registerPanel(P_SAVING, {
  panelSelector: ".saving-panel",

  async url() {
    const {endpoint} = await App.getSettings("endpoint")

    return `${endpoint}/api/v1/bookmarks`
  },

  async handleLogout() {
    await App.setSettings({ "access_token": null })
    App.showPanel(P_LOGIN)
  },

  // This method is called after the panel is shown
  async run() {
    const activeTab = await App.currentTab()
    const url = await this.url()
    const {access_token} = await App.getSettings("access_token")

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
      "Accept": "application/vnd.api+json",
      "Authorization": `Bearer ${access_token}`
    })

    const fetchParams = {
      method: "POST",
      headers: headers,
      body: JSON.stringify(data)
    }

    const response = await fetch(url, fetchParams)

    if(response.status === 401)
      return this.handleLogout()

    if(!response.ok)
      throw new TypeError(`Non-Okay response back from the server: ${response.status}`)

    const json = await response.json()

    App.changeIcon(BOOKMARK_ICON_FILL)

    return App.showPanel(P_DETAILS, json)
  }
})


App.registerPanel(P_DETAILS, {
  panelSelector: ".details-panel",

  _payload: {},

  _titleInput: document.getElementById("details-title"),
  _tagsInput: document.getElementById("details-tags"),
  _descriptionInput: document.getElementById("details-description"),

  _button: document.querySelector(".update-button"),

  async url() {
    const {endpoint} = await App.getSettings("endpoint")

    return `${endpoint}/api/v1/bookmarks/${this._payload.data.id}`
  },

  async handleLogout() {
    await App.setSettings({ "access_token": null })
    App.showPanel(P_LOGIN)
  },

  async updateButtonHandler() {
    const url = await this.url()
    const {access_token} = await App.getSettings("access_token")

    const tags = this._tagsInput.value.split(",")

    const payload = {
      data: {
        type: "bookmark",
        id: this._payload.data.id,
        attributes: {
          title: this._titleInput.value,
          tags: tags,
          description: this._descriptionInput.value
        }
      }
    }

    const headers = new Headers({
      "Content-Type": "application/vnd.api+json",
      "Accept": "application/vnd.api+json",
      "Authorization": `Bearer ${access_token}`
    })

    const fetchParams = {
      method: "PATCH",
      headers: headers,
      body: JSON.stringify(payload)
    }

    const response = await fetch(url, fetchParams)

    if(response.status === 401)
      return this.handleLogout()

    if(!response.ok)
      throw new TypeError(`Non-Okay response back from the server: ${response.status}`)

    window.close()
  },

  populateForm() {
    this._titleInput.value             = this._payload.data.attributes.title
    this._tagsInput.value              = this._payload.data.attributes.tags.join(", ")
    this._descriptionInput.textContent = this._payload.data.attributes.description
  },

  // This method is called when the panel is about to be shown.
  prepare(json) {
    this._payload = json

    this.populateForm()

    App.addEnterHandler(this._button, this.updateButtonHandler.bind(this))
  }
})


App.registerPanel(P_ERROR, {
  panelSelector: ".error-panel",

  _errorMessage: document.getElementById("error-message"),

  // This method is called when the panel is about to be shown.
  prepare(error) {
    this._errorMessage.innerText = error.message
  }
})


App.init().catch((error) => App.showPanel(P_ERROR, error))
