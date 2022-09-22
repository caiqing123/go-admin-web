<template>
  <div>
    <van-sticky style="margin-top: 15px">
      <ui-audio id="music-audio" mode="html5" controls loop="0" />
    </van-sticky>
    <van-search v-model="name" placeholder="搜索为空显示默认" @search="onSearch" />
    <van-tabs v-model="activeName" title-active-color="#409EFF" @click="handleClick">
      <van-tab v-for="(value, index) in data" :key="index" :title="value.Value" :name="value.Id">
        <van-list
          v-model="loading"
          :finished="finished"
          :offset="200"
          finished-text="没有更多了"
          @load="onLoad"
        >
          <van-cell v-for="(v, i) in list" :key="i">
            <div :style="{fontSize: '18px',color: i === k ? '#409EFF':''}">
              <span v-if="v.song_url">{{ v.title }}</span>
              <span v-else style="color: #dfdfdf">{{ v.song_name }}</span>
              <span v-if="v.song_url" style="margin-left: 15px;">
                <a :class="v.activeName" class="el-icon-video-play" :data-src="v.song_url" @click="play(v.song_url,v.song_name,i,$event)" />
                <a style="font-weight:bold;margin-left: 10px" class="el-icon-download" @click="download(v.song_url,v.song_name)" />
              </span>
            </div>
          </van-cell>
        </van-list>
      </van-tab>
    </van-tabs>
    <Tabbar />
  </div>
</template>
<script>
import Vue from 'vue'
import { Tab, Tabs, List, Cell, Search, Sticky } from 'vant'
import 'vant/lib/tab/style'
import 'vant/lib/tabs/style'
import 'vant/lib/list/style'
import 'vant/lib/cell/style'
import 'vant/lib/search/style'
import 'vant/lib/sticky/style'
import { getMusic } from '@/api/monitor/server'
import Tabbar from '@/components/Tabbar.vue'
import { saveAs } from 'file-saver'
import '@/vendor/howler/ui-audio'

Vue.use(List)
Vue.use(Tab)
Vue.use(Tabs)
Vue.use(Cell)
Vue.use(Search)
Vue.use(Sticky)

export default {
  name: 'Music',
  components: {
    Tabbar
  },
  data() {
    return {
      data: [
        { Id: 'kuwo', Value: '酷我' },
        { Id: 'migu', Value: '咪咕' },
        { Id: 'kugou', Value: '酷狗' },
        { Id: 'qq', Value: 'qq' },
        { Id: 'qianqian', Value: '百度' },
        { Id: 'netease', Value: '网易' }
      ],
      activeName: 'kuwo',
      list: [],
      playList: [],
      finished: false,
      loading: false,
      p: 1,
      name: '',
      audio: {},
      k: -1
    }
  },
  created() {
    this.$nextTick(() => {
      this.audio = document.getElementById('music-audio')
      const that = this
      // 添加事件处理
      this.audio.addEventListener('play', function() {
        // 播放时的地址设置
        that.setSrc()
        // 状态设置
        that.audioListStatus()
      })
      this.audio.addEventListener('pause', function() {
        // 状态设置
        that.audioListStatus()
      })
      this.audio.addEventListener('error', function() {
        console.log(111)
      })
    })
    this.getMusic()
  },
  methods: {
    getMusic() {
      this.finished = false
      getMusic({ option: this.activeName, name: this.name, p: this.p }).then(response => {
        if (response.data.length === 0) {
          this.finished = true
        } else {
          response.data.forEach((item, index) => {
            if (item.song_url) {
              this.playList.push(item)
              if (this.k === -1) {
                this.k = index
              }
            }
            item.activeName = this.activeName
            this.list.push(item)
          })
          if (this.playList[0]) {
            this.audio.src = this.playList[0].song_url
            this.audio.label = this.playList[0].song_name
            this.setSrc()
            this.audioListStatus(0)
          }
        }
        if (this.name === '') {
          this.finished = true
        }
        this.loading = false
      }).catch(error => {
        console.log(error)
        this.list = []
        this.playList = []
        this.loading = false
        this.finished = true
      })
    },
    handleClick() {
      this.k = -1
      this.list = []
      this.playList = []
      this.p = 1
      this.getMusic()
    },
    onSearch() {
      this.k = -1
      this.list = []
      this.playList = []
      this.p = 1
      this.getMusic()
    },
    onLoad() {
      if (this.name === '') {
        return
      }
      this.p++
      this.getMusic()
    },
    ext(url) {
      return this.isExt(url.split('.').pop().toLowerCase())
    },
    isExt(ext) {
      if (ext.indexOf('flac') !== -1) {
        return 'flac'
      }
      if (ext.indexOf('m4a') !== -1) {
        return 'm4a'
      }
      return 'mp3'
    },
    download(url, name) {
      const fileExtension = this.ext(url)
      saveAs(process.env.VUE_APP_BASE_API + '/api/v1/download?url=' + encodeURIComponent(url) + '&name=' + name + '.' + fileExtension, name + '.' + fileExtension)
    },
    play(url, name, k, event) {
      const className = event.target.className
      this.k = k

      this.audio.src = url
      this.audio.label = name
      if (className === 'el-icon-video-pause ' + this.activeName) {
        this.audio.pause()
      } else {
        this.audio.play()
      }
      this.setSrc()
      this.audioListStatus()
    },
    setSrc() {
      // 根据 src 获得 index
      const index = this.playList.findIndex((obj) => {
        return obj.song_url === this.audio.src
      })

      if (index < 0) {
        return
      }

      // 标题
      this.audio.label = this.playList[index].song_name

      // 上一个，下一个
      const dataPrev = this.playList[index - 1]
      const dataNext = this.playList[index + 1]

      // 随机
      const arrIndexFilter = []
      this.playList.forEach((obj, i) => {
        if (i !== index) {
          arrIndexFilter.push(i)
        }
      })

      const indexRandNext = arrIndexFilter[Math.floor(Math.random() * arrIndexFilter.length)]

      // 再次随机
      const arrIndexFilter2 = []
      this.playList.forEach((obj, i) => {
        if (i !== index && i !== indexRandNext) {
          arrIndexFilter2.push(i)
        }
      })

      const indexRandprev = arrIndexFilter2[Math.floor(Math.random() * arrIndexFilter2.length)]

      // 开始设置地址
      // 下一个地址处理
      // 如果是随机播放
      if (this.audio.loop === '1') {
        this.audio.prevsrc = this.playList[indexRandprev].song_url
        this.audio.nextsrc = this.playList[indexRandNext].song_url
      } else if (dataPrev) {
        this.audio.prevsrc = dataPrev.song_url
        this.audio.nextsrc = dataNext.song_url
      } else if (dataNext) {
        this.audio.nextsrc = dataNext.song_url
      } else {
        this.audio.prevsrc = 'none'
        this.audio.nextsrc = 'none'
      }
    },
    audioListStatus(init = -1) {
      this.$nextTick(() => {
        const plays = document.getElementsByClassName(this.activeName)
        for (let i = 0; i < plays.length; i++) {
          if (plays[i].getAttribute('data-src') === this.audio.src) {
            this.k = i
            if (init !== 0) {
              // 是否播放
              if (!this.audio.paused) {
                plays[i].className = 'el-icon-video-pause ' + this.activeName
              } else {
                plays[i].className = 'el-icon-video-play ' + this.activeName
              }
            }
          } else {
            plays[i].className = 'el-icon-video-play ' + this.activeName
          }
        }
      })
    }
  }
}
</script>

<style>
.van-tabs__line{
  position: absolute;
  bottom: 15px;
  left: 0;
  z-index: 1;
  width: 40px;
  height: 3px;
  background-color:#409EFF;
  border-radius: 3px;
}

</style>

