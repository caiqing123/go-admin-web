<template>
  <BasicLayout>
    <template #wrapper>
      <el-card class="box-card">
        <el-form>
          <el-form-item>
            <el-button type="primary" icon="el-icon-delete" size="mini" @click="logEmpty()">清空</el-button>
          </el-form-item>
        </el-form>
        <el-row ref="log" :gutter="10" class="mb8">
          <el-scrollbar style="height:500px;background-color: black;color: cornflowerblue;">
            <ul
              style="line-height: 25px;padding-top: 15px;padding-bottom: 15px;min-height: 500px; margin: 0;list-style-type: none;"
            >
              <li v-for="(item,index) in arrs" :key="index">

                {{ item }}
              </li>
            </ul>
          </el-scrollbar>
        </el-row>
      </el-card>
    </template>
  </BasicLayout>

</template>

<script>

import { unWsLogout } from '@/api/ws'

export default {
  name: 'SysJobLogManage',
  data() {
    return {
      websock: null,
      arrs: [],
      group: undefined
    }
  },
  created() {
    this.group = 'cron'
    this.initWebSocket()
  },
  destroyed() {
    console.log('断开websocket连接')
    this.websock.close() // 离开路由之后断开websocket连接
    unWsLogout(this.group, this.$store.state.user.token).then(response => {
      console.log(response.data)
    })
  },
  methods: {
    initWebSocket() { // 初始化weosocket
      const ws = process.env.VUE_APP_BASE_WS_API === '' ? 'ws://' + window.location.hostname : process.env.VUE_APP_BASE_WS_API
      const wsurl = ws + '/ws/' + this.group + '?token=' + this.$store.state.user.token
      this.websock = new WebSocket(wsurl)
      this.websock.onmessage = this.websocketonmessage
      this.websock.onopen = this.websocketonopen
      this.websock.onerror = this.websocketonerror
      this.websock.onclose = this.websocketclose
    },
    websocketonopen() { // 连接建立之后执行send方法发送数据
      console.log('连接打开')
      //   const actions = { 'test': '12345' }
      //   this.websocketsend(JSON.stringify(actions))
    },
    websocketonerror() { // 连接建立失败重连
      console.log('连接失败')
    },
    websocketonmessage(e) { // 数据接收
      this.arrs.unshift(JSON.parse(e.data)['data'])
    },
    websocketsend(Data) { // 数据发送
      //   this.websock.send(Data)
    },
    websocketclose(e) { // 关闭
      unWsLogout(this.group, this.$store.state.user.token).then(response => {
        console.log(response.data)
      })
      console.log('断开连接', e)
    },
    logEmpty() {
      this.arrs = []
    }
  }
}

</script>
