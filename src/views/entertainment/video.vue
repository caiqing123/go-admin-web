<template>
  <div>
    <van-search
      v-model="wd"
      show-action
      placeholder="请输入搜索关键词"
      @search="onSearch"
    >
      <template #action>
        <el-button type="primary" @click="onSearch">搜索</el-button>
      </template>
    </van-search>
    <van-tabs v-model="activeName" title-active-color="#409EFF" @click="handleClick">
      <van-tab v-for="(value, index) in data" :key="index" :title="value.Value" :name="value.Id">
        <van-list
          v-model="loading"
          :finished="finished"
          :offset="200"
          finished-text="没有更多了"
          @load="onLoad"
        >
          <van-cell v-for="(v, i) in list" id="video" :key="i">
            <el-card :body-style="{ padding: '0px' }">
              <img
                :src="v.Pic"
                class="image"
                alt="图片"
              >
              <div style="padding: 14px;">
                <span>{{ v.Name }}</span>
                <div class="bottom clearfix">
                  <time class="time">{{ v.Last }}</time>
                  <router-link :to="`/videoInfo?id=${v.Id}`">
                    <el-button type="text" class="button">查看</el-button>
                  </router-link>
                </div>
              </div>
            </el-card>
          </van-cell>
        </van-list>
      </van-tab>
    </van-tabs>
    <Tabbar />
  </div>
</template>
<script>
import Vue from 'vue'
import { Tab, Tabs, List, Cell, Search } from 'vant'
import 'vant/lib/tab/style'
import 'vant/lib/tabs/style'
import 'vant/lib/list/style'
import 'vant/lib/cell/style'
import 'vant/lib/search/style'
import { getVideoType, getVideo } from '@/api/monitor/server'
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
Vue.use(Search)

export default {
  name: 'Video',
  components: {
    Tabbar
  },
  data() {
    return {
      data: [
        { Id: 0, Value: '推荐' }
      ],
      activeName: 0,
      list: [],
      finished: false,
      loading: false,
      p: 0,
      wd: ''
    }
  },
  created() {
    this.getVideoType()
  },
  methods: {
    getVideoType() {
      const loading = Loading.service(options)
      getVideoType().then(response => {
        response.data.Class.forEach(item => {
          if ([1, 2, 3].includes(item.Id)) {
            return
          }
          this.data.push({ Id: item.Id, Value: item.Value })
        })
        loading.close()
      }).catch(function() {
        loading.close()
      })
    },
    getVideo(type) {
      this.finished = false
      getVideo({ t: type, wd: this.wd, p: this.p }).then(response => {
        response.data.List.forEach(item => {
          this.list.push(item)
        })
        this.loading = false
        if (response.data.List.length === 0) {
          this.finished = true
        }
      }).catch(error => {
        console.log(error)
        this.list = []
        this.loading = false
        this.finished = true
      })
    },
    handleClick(name, title) {
      this.list = []
      this.p = 0
      this.getVideo(name)
    },
    onSearch() {
      this.list = []
      this.p = 0
      this.getVideo(this.activeName)
    },
    onLoad() {
      this.p++
      this.getVideo(this.activeName)
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
#video .image {
  width: 100%;
  display: block;
}
#video .time {
  font-size: 13px;
  color: #999;
}
#video .bottom {
  margin-top: 13px;
  line-height: 12px;
}
#video .button {
  padding: 0;
  float: right;
}

</style>

