<template>
  <div>
    <van-nav-bar
      :title="title"
      left-arrow
      @click-left="onClickLeft"
    />
    <div id="video-player" />
    <van-collapse v-model="activeName" accordion>
      <van-collapse-item title="集数" name="1">
        <van-grid :gutter="5" :column-num="10">
          <van-grid-item v-for="(value, index) in playList" :key="index" @click="handleClick(value)">
            <span v-if="value.key === n" style="color: #0f82ff">{{ value.key.toString() }}</span>
            <span v-if="value.key !== n">{{ value.key.toString() }}</span>
          </van-grid-item>
        </van-grid>
      </van-collapse-item>
      <van-collapse-item title="描述" name="2">
        <span v-html="data.Des" />
      </van-collapse-item>
    </van-collapse>
  </div>
</template>

<script>
import Vue from 'vue'
import { NavBar, Grid, GridItem, Collapse, CollapseItem } from 'vant'
import 'vant/lib/nav-bar/style'
import 'vant/lib/grid/style'
import 'vant/lib/grid-item/style'
import 'vant/lib/collapse/style'
import 'vant/lib/collapse-item/style'
import { getVideo } from '@/api/monitor/server'
import Artplayer from 'artplayer'
import flvjs from 'flv.js'
import Hls from 'hls.js'

Vue.use(NavBar)
Vue.use(Grid)
Vue.use(GridItem)
Vue.use(Collapse)
Vue.use(CollapseItem)

export default {
  name: 'VideoInfo',
  data() {
    return {
      data: [],
      title: '',
      selector: [],
      config: {
        container: '#video-player',
        url: '',
        poster: '',
        title: '',
        autoplay: true,
        autoSize: false,
        autoMini: true,
        loop: false,
        flip: true,
        playbackRate: true,
        aspectRatio: true,
        setting: true,
        hotkey: true,
        pip: true,
        mutex: true,
        fullscreen: true,
        // fullscreenWeb: true,
        miniProgressBar: false,
        playsInline: true,
        theme: '#409EFF',
        controls: [
          {
            position: 'right',
            html: '集数',
            selector: [],
            onSelect: function(item, $dom) {
              this.n = item.key
              this.config.url = item.url
              this.player.url = item.url
              this.player.play()
              return '集数'
            }.bind(this)
          }
        ],
        quality: [],
        whitelist: ['*'],
        moreVideoAttr: {
          controls: true,
          'webkit-playsinline': true,
          playsInline: true
        },
        customType: {
          flv: function(video, url) {
            const flvPlayer = flvjs.createPlayer(
              {
                type: 'flv',
                url: url
              },
              { referrerPolicy: 'same-origin' }
            )
            flvPlayer.attachMediaElement(video)
            flvPlayer.load()
          },
          m3u8: function(video, url) {
            const hls = new Hls()
            hls.loadSource(url)
            hls.attachMedia(video)
          }
        },
        lang: 'zh-cn',
        lock: true,
        fastForward: true,
        autoPlayback: true,
        autoOrientation: true,
        airplay: true
      },
      player: null,
      playList: [],
      activeName: '1',
      n: 1
    }
  },
  mounted() {
    this.getVideo()
  },
  beforeDestroy() {
    this.player && typeof this.player.destroy === 'function' && this.player.destroy()
  },
  methods: {
    getVideo() {
      getVideo({ ids: this.$route.query.id }).then(response => {
        this.data = response.data.List[0]
        this.data.Dd.split('#').forEach((item, k) => {
          const url = item.split('$')
          if (k === 0) {
            this.config.url = url[1]
          }
          this.playList.push({
            key: k + 1,
            name: url[0],
            url: url[1]
          })
          this.selector.push({
            default: k === 0,
            html: url[0],
            url: url[1],
            key: k + 1
          })
        })
        this.config.title = this.data.Name
        this.config.poster = this.data.Pic
        this.config.controls[0].selector = this.selector
        this.title = this.data.Name
        document.title = this.data.Name
        this.player = new Artplayer(this.config)

        this.player.on('video:ended', () => {
          const index = this.playList.findIndex((f) => f.url === this.config.url)
          if (this.playList[index + 1]) {
            this.selector[index].default = false
            this.selector[index + 1].default = true
            this.n = index + 2
            this.config.url = this.playList[index + 1].url
            this.player.switchUrl(this.playList[index + 1].url, this.playList[index + 1].name)
          }
        })
      })
    },
    handleClick(value) {
      this.n = value.key
      this.config.url = value.url
      this.player.url = value.url
      this.player.play()
    },
    onClickLeft() {
      this.$router.go(-1)
    }
  }
}
</script>

<style>
#video-player{
  width: 100%;
  height: 300px;
}
.van-grid-item__content{
  padding: 5px 5px;
}
</style>

