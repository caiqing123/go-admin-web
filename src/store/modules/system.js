import { getSetting } from '@/api/login'
import storage from '@/utils/storage'
const state = {
  info: storage.get('app_info')
}

const mutations = {
  SET_INFO: (state, data) => {
    state.info = data
    storage.set('app_info', data)
  }
}

const actions = {
  settingDetail({ commit }) {
    return new Promise((resolve, reject) => {
      getSetting().then(response => {
        const { data } = response
        data.sys_app_logo = data.sys_app_logo ? data.sys_app_logo : 'https://img2.baidu.com/it/u=1681391545,4187928589&fm=253&fmt=auto&app=138&f=PNG?w=400&h=400'
        commit('SET_INFO', data)
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
