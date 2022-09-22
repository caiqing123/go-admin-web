const state = {
  readingBook: {},
  popCataVisible: false,
  readSettingsVisible: false,
  miniInterface: false,
  showContent: false,
  catalog: '',
  config: {
    theme: 0,
    font: 0,
    fontSize: 18,
    readWidth: 800,
    infiniteLoading: false
  },
  contentLoading: true
}

const mutations = {
  setCatalog(state, catalog) {
    state.catalog = catalog
  },
  setPopCataVisible(state, visible) {
    state.popCataVisible = visible
  },
  setContentLoading(state, loading) {
    state.contentLoading = loading
  },
  setReadingBook(state, readingBook) {
    state.readingBook = readingBook
  },
  setConfig(state, config) {
    state.config = config
  },
  setReadSettingsVisible(state, visible) {
    state.readSettingsVisible = visible
  },
  setShowContent(state, visible) {
    state.showContent = visible
  },
  setMiniInterface(state, mini) {
    state.miniInterface = mini
  }
}

const actions = {
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}

