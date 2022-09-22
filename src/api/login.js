import request from '@/utils/request'

// 获取验证码
export function getCodeImg() {
  return request({
    url: '/api/v1/captcha',
    method: 'get'
  })
}

// 查询 此接口不在验证数据权限
export function getSetting(type = 1) {
  return request({
    url: '/api/v1/app-config?type=' + type,
    method: 'get'
  })
}
