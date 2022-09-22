import request from '@/utils/request'

// 查询服务器详细
export function getServer() {
  return request({
    url: '/api/v1/server-monitor',
    method: 'get'
  })
}

export function getMusic(query) {
  return request({
    url: '/api/v1/music',
    method: 'get',
    params: query
  })
}

export function getBook(query) {
  return request({
    url: '/api/v1/book',
    method: 'get',
    params: query
  })
}

export function getBookInfo(query) {
  return request({
    url: '/api/v1/book_info',
    method: 'get',
    params: query
  })
}

export function getBookChapter(query) {
  return request({
    url: '/api/v1/book_chapter',
    method: 'get',
    params: query
  })
}

export function getNews(query) {
  return request({
    url: '/api/v1/news',
    method: 'get',
    params: query
  })
}

export function getVideoType() {
  return request({
    url: '/api/v1/video_type',
    method: 'get'
  })
}

export function getVideo(query) {
  return request({
    url: '/api/v1/video',
    method: 'get',
    params: query
  })
}

