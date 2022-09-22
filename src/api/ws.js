import request from '@/utils/request'

// 查询SysJob列表
export function unWsLogout(group, token) {
  return request({
    url: '/wslogout/' + group + '?token=' + token,
    method: 'get'
  })
}
