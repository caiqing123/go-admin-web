import request from '@/utils/request'

// 根据参数键名查询参数值
export function getConfigKey(configKey) {
  return request({
    url: '/api/v1/configKey/' + configKey,
    method: 'get'
  })
}

export function getSetConfig(query) {
  return request({
    url: '/api/v1/set-config',
    method: 'get'
  })
}

export function updateSetConfig(data) {
  return request({
    url: '/api/v1/set-config',
    method: 'put',
    data: data
  })
}
