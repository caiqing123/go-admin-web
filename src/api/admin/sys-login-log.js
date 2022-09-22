import request from '@/utils/request'

// 查询SysLoginlog列表
export function listSysLoginlog(query) {
  return request({
    url: '/api/v1/login_log',
    method: 'get',
    params: query
  })
}
