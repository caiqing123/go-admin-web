<template>
  <div>
    <van-tabs v-model="activeName" title-active-color="#409EFF" @click="handleClick">
      <van-tab v-for="(value, index) in data" :key="index" :title="value.label" :name="value.name">
        <van-list
          :finished="finished"
          finished-text="没有更多了"
        >
          <van-cell v-for="(v, i) in list" :key="i" style="cursor: pointer;" :title="v.title" @click="jump(v.url)" />
        </van-list>
      </van-tab>
    </van-tabs>
    <Tabbar />
  </div>
</template>
<script>
import Vue from 'vue'
import { Tab, Tabs, List, Cell } from 'vant'
import 'vant/lib/tab/style'
import 'vant/lib/tabs/style'
import 'vant/lib/list/style'
import 'vant/lib/cell/style'
import { getNews } from '@/api/monitor/server'
import { Loading } from 'element-ui'
import Tabbar from '@/components/Tabbar.vue'

const options = {
  lock: true,
  text: 'Loading',
  spinner: 'el-icon-loading'
}

Vue.use(List)
Vue.use(Tab)
Vue.use(Tabs)
Vue.use(Cell)

export default {
  name: 'News',
  components: {
    Tabbar
  },
  data() {
    return {
      data: [
        { label: '微博', name: 'WeiBo' },
        { label: '知乎', name: 'ZhiHu' },
        { label: '豆瓣', name: 'DouBan' },
        { label: '天涯', name: 'TianYa' },
        { label: '虎扑', name: 'HuPu' },
        { label: '百度', name: 'BaiDu' },
        { label: '36氪', name: '36Kr' },
        { label: '果壳', name: 'GuoKr' },
        { label: '虎嗅', name: 'HuXiu' },
        { label: '知乎日报', name: 'ZHDaily' },
        { label: 'segmentfault', name: 'Segmentfault' },
        { label: '网易', name: 'WYNews' },
        { label: '水木社区', name: 'WaterAndWood' },
        { label: '链滴', name: 'HacPai' },
        { label: '凯迪网', name: 'KD' },
        { label: '微信', name: 'WeiXin' },
        { label: 'chiphell', name: 'Chiphell' },
        { label: '煎蛋', name: 'JianDan' },
        { label: 'it之家', name: 'ITHome' },
        { label: 'csdn', name: 'CSDN' },
        { label: 'nga玩家社区', name: 'NGA' }
      ],
      activeName: 'WeiBo',
      list: [],
      finished: false
    }
  },
  created() {
    this.getNews(this.activeName)
  },
  methods: {
    getNews(type) {
      const loading = Loading.service(options)
      this.finished = false
      getNews({ type: type }).then(response => {
        this.list = response.data
        this.finished = true
        loading.close()
      }).catch(function() {
        this.finished = true
        loading.close()
      })
    },
    handleClick(name, title) {
      this.getNews(name)
    },
    jump(url) {
      window.open(url)
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

