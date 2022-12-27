<template>
  <van-tabbar route>
    <van-tabbar-item replace to="/news" icon="fire-o">资讯</van-tabbar-item>
    <van-tabbar-item replace to="/video" icon="video-o">视频</van-tabbar-item>
    <van-tabbar-item replace to="/book" icon="description">小说</van-tabbar-item>
    <van-tabbar-item replace to="/music" icon="service-o">音乐</van-tabbar-item>
    <van-tabbar-item replace to="/chat" icon="chat-o">聊天室</van-tabbar-item>
  </van-tabbar>
</template>

<script>
import Vue from 'vue'
import { Tabbar, TabbarItem } from 'vant'
import 'vant/lib/tabbar/style'
import 'vant/lib/tabbar-item/style'
import FingerprintJS from '@fingerprintjs/fingerprintjs'
import storage from '@/utils/storage'

Vue.use(Tabbar)
Vue.use(TabbarItem)

export default {
  name: 'Tabbar',
  data() {
    return {
    }
  },
  created() {
    (async() => {
      if (!storage.get('visitor_id')) {
        const fpPromise = FingerprintJS.load({ monitoring: false })
        const fp = await fpPromise
        const result = await fp.get()
        storage.set('visitor_id', result.visitorId)
      }
    })()
  },
  mounted() {
  }
}
</script>
