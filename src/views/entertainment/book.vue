<template>
  <div>
    <el-card class="box-card">
      <div slot="header">
        <el-input v-model="form.name" size="mini" placeholder="请输入内容" class="input-with-select">
          <el-button slot="append" icon="el-icon-search" @click="getBookList" />
        </el-input>
      </div>
      <el-tabs v-model="activeName" @tab-click="handleClick">
        <el-tab-pane v-for="(value, index) in data" :key="index" :label="index" :name="index">
          <div v-for="(v, i) in value" :key="i" class="text item">
            <span><a @click="getBookInfo(v.BookURL)">{{ v.BookName }}</a></span><br>
            <span style="color: #aaa">{{ v.Author }}</span>
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <el-dialog
      :title="title"
      :visible.sync="centerDialogVisible"
      width="90%"
      @close="handleClose"
    >
      <div class="book-info-content">
        <div class="book-info-cover">
          <img :src="bookInfo.CoverURL" alt="">
        </div>
        <div class="book-info-describle">
          <h3 class="book-info-title">{{ bookInfo.BookName }}</h3>
          <p>作者：{{ bookInfo.Author }}</p>
        </div>
      </div>
      <div class="btn-info-group">
        <el-button type="primary" :disabled="!total>0" class="el-icon-view">
          <a v-show="total>0" @click="read(bookInfo)">开始阅读</a>
        </el-button>
        <div class="button">
          <el-button class="open el-icon-caret-right" @click="downloadWs(bookInfo.BookURL)">下载</el-button>
          <span class="progress" />
        </div>
      </div>
      <div class="info-longintro">
        <p>{{ bookInfo.Description }}</p>
      </div>
      <div class="info-last-chapter">
        <div v-for="(v, i) in pages" :key="i" class="text item">
          {{ v.Name }}
        </div>
        <pagination
          v-show="total>0"
          small
          layout="total, prev, pager, next"
          :pager-count="pagerCount"
          :total="total"
          :page.sync="queryParams.page"
          :limit.sync="queryParams.per_page"
          @pagination="getBookPage"
        />
      </div>
    </el-dialog>

    <div class="fixed-widgets" @click="downLog"><span class="el-icon-upload" /></div>
    <el-dialog
      title="记录"
      :visible.sync="downlogVisible"
      width="80%"
    >
      <van-collapse v-model="activeNames">
        <van-collapse-item title="阅读记录" name="1">
          <div v-if="!readList">无记录</div>
          <div v-for="(v, i) in readList" :key="i" class="text item">
            <router-link target="_blank" :to="{path:'/chapter',query:{url:v.BookURL,cacheLoadURL:v.CacheLoadURL}}">
              <span style="color: #409eff;">{{ v.BookName }}</span>
            </router-link>
          </div>
        </van-collapse-item>
        <van-collapse-item title="下载记录" name="2">
          <div v-if="!bookList">无记录</div>
          <div v-for="(v, i) in bookList" :key="i" class="text item">
            <a
              style="color: #409eff;"
              @click="download(v)"
            >{{ v.split('_')[0] }}</a>
          </div>
        </van-collapse-item>
      </van-collapse>
    </el-dialog>
    <Tabbar />
  </div>
</template>
<script>
import { getBook, getBookInfo } from '@/api/monitor/server'
import { Loading } from 'element-ui'
import { unWsLogout } from '@/api/ws'
import { saveAs } from 'file-saver'
import Tabbar from '@/components/Tabbar.vue'
import storage from '@/utils/storage'
import crypto from 'crypto'
import { Collapse, CollapseItem } from 'vant'
import 'vant/lib/collapse/style'
import 'vant/lib/collapse-item/style'
import Vue from 'vue'

Vue.use(Collapse)
Vue.use(CollapseItem)

const options = {
  lock: true,
  text: 'Loading',
  spinner: 'el-icon-loading'
}

export default {
  name: 'Book',
  components: {
    Tabbar
  },
  data() {
    return {
      form: {
        name: ''
      },
      data: [],
      bookInfo: [],
      chapters: [],
      centerDialogVisible: false,
      downlogVisible: false,
      title: '',
      activeName: '',
      visitorId: '',
      queryParams: {
        page: 1,
        per_page: 10
      },
      activeNames: ['1'],
      pagerCount: 5,
      total: 0,
      pages: [],
      websock: null,
      bookList: [],
      readList: []
    }
  },
  created() {
    this.readList = JSON.parse(localStorage.getItem('reading_records'))
    this.sleep(500).then(() => {
      this.visitorId = storage.get('visitor_id')
      this.getServerInfo()
    })
    // 监听页面可见事件
    document.addEventListener('visibilitychange', e => {
      // 页面不可见
      if (document.hidden) {
        // this.websock.close()
      } else { // 页面可见
        // 延迟处理，防止网页被挂起后，websocket关闭状态未修改
        this.sleep(500).then(() => {
          if (this.websock.readyState !== 1) {
            this.getServerInfo()
          }
        })
      }
    })
  },
  methods: {
    sleep(time) {
      return new Promise((resolve) => setTimeout(resolve, time))
    },
    downloadWs(url) {
      if (this.bookInfo.DownloadURL) {
        const fileExtension = this.bookInfo.DownloadURL.split('.').pop().toLowerCase()
        saveAs(this.bookInfo.DownloadURL, this.bookInfo.BookName + '.' + fileExtension)
      } else {
        this.websocketsend('{"group":"book","parameters":{"url":"' + url + '"}}')
        const text = document.querySelectorAll('.open')[0]
        text.classList.remove('el-icon-caret-right')
        text.classList.add('el-icon-download')
        text.innerText = '生成中'
        text.disabled = true
      }
    },
    read(bookInfo) {
      const reading_records = JSON.parse(localStorage.getItem('reading_records'))
      if (reading_records) {
        const book = { BookName: bookInfo.BookName, BookURL: bookInfo.BookURL, CacheLoadURL: bookInfo.CacheLoadURL }
        const result = reading_records.some(function(item) {
          return item.BookURL === book.BookURL
        })
        if (!result) {
          reading_records.push(book)
        }
        this.readList = reading_records
        localStorage.setItem('reading_records', JSON.stringify(reading_records))
      } else {
        localStorage.setItem('reading_records', JSON.stringify([{ BookName: bookInfo.BookName, BookURL: bookInfo.BookURL, CacheLoadURL: bookInfo.CacheLoadURL }]))
      }

      const routeUrl = this.$router.resolve({
        path: '/chapter',
        query: { url: bookInfo.BookURL, cacheLoadURL: bookInfo.CacheLoadURL }
      })
      window.open(routeUrl.href, '_blank')
    },
    download(url) {
      const bookName = url.split('_')[0]
      url = process.env.VUE_APP_BASE_API + '/uploads/book/' + url
      const fileExtension = url.split('.').pop().toLowerCase()
      saveAs(url, bookName + '.' + fileExtension)
    },
    downLog() {
      this.websocketsend('{"group":"book","parameters":{"log":"true"}}')
      this.downlogVisible = true
    },
    handleClose() {
      this.centerDialogVisible = false
      this.queryParams.page = 1

      const pr = document.querySelectorAll('.progress')[0]
      const text = document.querySelectorAll('.open')[0]
      pr.style.left = '-100%'
      text.classList.remove('el-icon-check')
      text.classList.add('el-icon-caret-right')
      text.innerText = '下载'
    },
    getBookInfo(bookURL) {
      const loading = Loading.service(options)
      getBookInfo({ url: bookURL, visitorId: this.visitorId }).then(response => {
        this.bookInfo = response.data
        this.title = this.bookInfo.BookName
        this.chapters = this.bookInfo.Volumes[0].Chapters
        this.total = this.chapters.length
        this.pages = this.pagination(this.queryParams.per_page, this.queryParams.page, this.chapters)
        this.centerDialogVisible = true
        if (this.bookInfo.DownloadURL !== '' && this.bookInfo.DownloadURL.indexOf('http') === -1) {
          this.bookInfo.DownloadURL = process.env.VUE_APP_BASE_API + this.bookInfo.DownloadURL
        }
        if (this.bookInfo.CacheLoadURL !== '' && this.bookInfo.CacheLoadURL.indexOf('http') === -1) {
          this.bookInfo.CacheLoadURL = process.env.VUE_APP_BASE_API + this.bookInfo.CacheLoadURL
        }
        loading.close()
      }).catch(function() {
        loading.close()
      })
    },
    getBookList() {
      const loading = Loading.service(options)
      getBook(this.form).then(response => {
        this.data = response.data
        this.activeName = Object.keys(response.data)[0]
        loading.close()
      }).catch(function() {
        loading.close()
      })
    },
    pagination(pageSize, currentPage, arr) {
      const skipNum = (currentPage - 1) * pageSize
      return (skipNum + pageSize >= arr.length) ? arr.slice(skipNum, arr.length) : arr.slice(skipNum, skipNum + pageSize)
    },
    getBookPage() {
      this.pages = this.pagination(this.queryParams.per_page, this.queryParams.page, this.chapters)
    },
    handleClick(tab, event) {
    },
    getServerInfo() {
      const ws = process.env.VUE_APP_BASE_WS_API === '' ? 'ws://' + window.location.hostname : process.env.VUE_APP_BASE_WS_API
      const wsurl = ws + '/ws/book?token=' + this.visitorId
      this.websock = new WebSocket(wsurl)
      this.websock.onmessage = this.websocketonmessage
      this.websock.onopen = this.websocketonopen
      this.websock.onerror = this.websocketonerror
      this.websock.onclose = this.websocketclose
    },
    websocketonopen() { // 连接建立之后执行send方法发送数据
      console.log('连接打开')
    },
    websocketonerror() { // 连接建立失败重连
      console.log('连接失败')
    },
    websocketonmessage(e) { // 数据接收
      this.info = JSON.parse(e.data)
      if (!this.info.data) {
        return
      }
      if (this.info.data.type && this.info.data.type === 'progress' && this.info.data.book_id === (this.bookInfo.BookName + '_' + this.visitorId)) {
        const pr = document.querySelectorAll('.progress')[0]
        const text = document.querySelectorAll('.open')[0]
        pr.style.left = this.info.data.progress - 100 + '%'
        if (this.info.data.progress === '100') {
          text.disabled = false
          text.classList.remove('el-icon-download')
          text.classList.add('el-icon-check')
          text.innerText = '已完成(点击下载)'
          const ext = this.bookInfo.BookURL.indexOf('bookstack.cn') === -1 ? '.txt' : '.epub'
          this.bookInfo.DownloadURL = process.env.VUE_APP_BASE_API + '/uploads/book/' + this.bookInfo.BookName + '_' + crypto.createHash('md5').update(this.bookInfo.BookURL).digest('hex') + '_' + this.visitorId + ext
          this.bookInfo.CacheLoadURL = process.env.VUE_APP_BASE_API + '/uploads/book/' + this.bookInfo.BookName + '_' + crypto.createHash('md5').update(this.bookInfo.BookURL).digest('hex') + '.json'
        }
      } else if (this.info.data.type && this.info.data.type === 'book_list') {
        this.bookList = this.info.data.list
      }
    },
    websocketsend(Data) { // 数据发送
      this.websock.send(Data)
    },
    websocketclose(e) { // 关闭
      unWsLogout('book', this.visitorId).then(response => {
        console.log(response.data)
      })
      console.log('断开连接', e)
    }
  }
}
</script>

<style scoped>
.box-card {
  margin: 5px;
}

.item {
  margin-bottom: 18px;
}

.book-info-content {
  padding: 0 20px 30px 30px;
  display: table;
  width: 100%;
}

.book-info-cover {
  width: 93px;
  height: 124px;
  margin-right: 18px;
  float: left;
  border: 1px solid #f0f0f0;
  box-shadow: 0 5px 10px #555;
  border-radius: 4px;
}

.book-info-cover > img {
  width: 100%;
  height: 100%;
}

.book-info-describle {
  vertical-align: middle;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.book-info-title {
  font-weight: normal;
  font-size: 16px;
  margin-bottom: 5px;
}

.book-info-describle p {
  font-size: 14px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.btn-info-group {
  width: 100%;
  font-size: 0;
  padding: 0 10px 10px;
  margin-bottom: 10px;
}

.button {
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
  position: relative;
  display: flex;
  float: left;
  margin-right: 10px;
  overflow: hidden;
}

.progress {
  z-index: 999;
  content: '';
  position: absolute;
  top: 90%;
  left: -100%;
  width: 100%;
  height: 100%;
  background: #409eff;
}

.info-longintro > p {
  padding: 10px 14px;
  line-height: 2em;
}

.info-longintro {
  border-bottom: 1px solid #DDD;
}

.info-last-chapter {
  padding: 10px 14px;
  margin-bottom: 10px;
  line-height: 28px;
}

.fixed-widgets {
  position: fixed;
  right: 0;
  top: 280px;
  display: flex;
  flex-direction: column;
  cursor: pointer;
}

.fixed-widgets span {
  width: 44px;
  height: 44px;
  line-height: 44px;
  font-size: 22px;
  color: #000;
  background-color: #fff;
  box-shadow: 0 3px 6px -4px #0000001f, 0 6px 16px #00000014, 0 9px 28px 8px #0000000d;
  transition: color .3s;
  box-sizing: border-box;
  margin: 0;
  padding: 0;
  font-variant: tabular-nums;
  list-style: none;
  font-feature-settings: "tnum";
  position: relative;
  display: inline-block;
  overflow: hidden;
  white-space: nowrap;
  text-align: center;
  vertical-align: middle;
  border-radius: 50%;
}
</style>

