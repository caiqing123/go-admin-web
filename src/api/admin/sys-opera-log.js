import request from '@/utils/request'

// 清空操作日志
export function cleanOperaLog() {
  return request({
    url: '/api/v1/opera_log/clean',
    method: 'delete'
  })
}

// 查询Operlog列表
export function listSysOperaLog(query) {
  return request({
    url: '/api/v1/opera_log',
    method: 'get',
    params: query
  })
}

