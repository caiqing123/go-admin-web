import variables from '@/styles/element-variables.scss'
import defaultSettings from '@/settings'
import { getSetting } from '@/api/login'

const { showSettings, topNav, tagsView, fixedHeader, sidebarLogo, themeStyle } = defaultSettings

const state = {
  theme: variables.theme,
  showSettings: showSettings,
  topNav: topNav,
  tagsView: tagsView,
  fixedHeader: fixedHeader,
  sidebarLogo: sidebarLogo,
  themeStyle: themeStyle
}

const mutations = {
  CHANGE_SETTING: (state, { key, value }) => {
    // eslint-disable-next-line no-prototype-builtins
    if (state.hasOwnProperty(key)) {
      state[key] = value
    }
  },
  CHANGE_SETTINGS: (state, data) => {
    state.theme = data['theme']
    state.themeStyle = data['themeStyle']
  }
}

const actions = {
  changeSetting({ commit }, data) {
    commit('CHANGE_SETTING', data)
  },
  systemSetting({ commit }) {
    return new Promise((resolve, reject) => {
      getSetting(0).then(response => {
        const { data } = response
        commit('CHANGE_SETTINGS', data)
        resolve(data)
      }).catch(error => {
        reject(error)
      })
    })
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}

