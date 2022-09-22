import request from '@/utils/request'

// 查询SysJob列表
export function listSysJob(query) {
  return request({
    url: '/api/v1/job',
    method: 'get',
    params: query
  })
}

// 查询SysJob详细
export function getSysJob(jobId) {
  return request({
    url: '/api/v1/job?id=' + jobId,
    method: 'get'
  })
}

// 新增SysJob
export function addSysJob(data) {
  return request({
    url: '/api/v1/job',
    method: 'post',
    data: data
  })
}

// 修改SysJob
export function updateSysJob(data) {
  return request({
    url: '/api/v1/job',
    method: 'put',
    data: data
  })
}

// 删除SysJob
export function delSysJob(data) {
  return request({
    url: '/api/v1/job',
    method: 'delete',
    data: data
  })
}

// 移除SysJob
export function removeJob(jobId) {
  return request({
    url: '/api/v1/job/remove?job_id=' + jobId,
    method: 'get'
  })
}

// 启动SysJob
export function startJob(jobId) {
  return request({
    url: '/api/v1/job/start?job_id=' + jobId,
    method: 'get'
  })
}

export function getParsecron(cron) {
  return request({
    url: '/api/v1/job/cron?expr=' + cron,
    method: 'get'
  })
}

