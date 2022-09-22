import axios from 'axios'
import { Message, MessageBox } from 'element-ui'
import store from '@/store'
import { getToken } from '@/utils/auth'
import { download } from '@/utils/costum'

// create an axios instance
const service = axios.create({
  baseURL: process.env.VUE_APP_BASE_API, // url = base url + request url
  // withCredentials: true, // send cookies when cross-domain requests
  timeout: 10000 // request timeout
})

// request interceptor
service.interceptors.request.use(
  (config) => {
    // do something before request is sent

    if (store.getters.token) {
      // let each request carry token
      // ['X-Token'] is a custom headers key
      // please modify it according to the actual situation
      config.headers['Authorization'] = 'Bearer ' + getToken()
      config.headers['Content-Type'] = 'application/json'
    }
    return config
  },
  (error) => {
    // do something with request error
    console.log(error) // for debug
    return Promise.reject(error)
  }
)

// response interceptor
service.interceptors.response.use(
  /**
   * If you want to get http information such as headers or status
   * Please return  response => response
   */

  /**
   * Determine the request status by custom code
   * Here is just an example
   * You can also judge the status by HTTP Status Code
   */
  (response) => {
    // 请求成功处理
    let contentDisposition
    if (response.headers['content-disposition']) contentDisposition = response.headers['content-disposition']
    if (response.headers['Content-Disposition']) contentDisposition = response.headers['Content-Disposition']
    // 导出文件处理
    if (contentDisposition) {
      const pat = new RegExp('filename=([^;]+\\.[^.;]+)')
      const result = pat.exec(decodeURI(contentDisposition))
      download(response.data, result && result[1])
    }

    return response.data
  },
  (error) => {
    const { response: res } = error
    if (error.message === 'Network Error') {
      Message({
        message: '服务器连接异常，请检查服务器！',
        type: 'error',
        duration: 5 * 1000
      })
      return Promise.reject(error)
    }
    if (error.message === 'timeout of 10000ms exceeded') {
      Message({
        message: '连接超时！',
        type: 'error',
        duration: 5 * 1000
      })
      return Promise.reject(error)
    }
    switch (res.status) {
      case 401:
        store.dispatch('user/resetToken')
        if (location.href.indexOf('login') !== -1) {
          location.reload() // 为了重新实例化vue-router对象 避免bug
        } else {
          MessageBox.confirm(
            '登录状态已过期，您可以继续留在该页面，或者重新登录',
            '系统提示',
            {
              confirmButtonText: '重新登录',
              cancelButtonText: '取消',
              type: 'warning'
            }
          ).then(() => {
            location.reload() // 为了重新实例化vue-router对象 避免bug
          })
        }
        break
      case 422:
        Message({
          message: res.data.error ? res.data.error : Object.values(res.data.errors)[0][0],
          type: 'error',
          duration: 3 * 1000
        })
        break
      default:
        Message({
          message: res.data.message,
          type: 'error',
          duration: 3 * 1000
        })
        break
    }
    return Promise.reject(error)
  }
)

export default service
