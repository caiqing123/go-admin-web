<template>
  <div class="message">
    <Panel :session="curSession" @back="changeSession({})" @sendMessage="sendMessage">
      <template slot="num">
        ({{ ChatInfo['clientLen'] }})
      </template>
      <div ref="message-list" class="iChat-message-warp">
        <div class="iChat-message-list">
          <ChatBubble
            v-for="(item,i) in messageData"
            :key="i"
            class="message-item"
            :message="item"
            :setting="setting"
            :is-send="users.id===item.from.id"
          />
        </div>
      </div>
    </Panel>

    <Tabbar />
  </div>
</template>

<script>
import Tabbar from '@/components/Tabbar.vue'
import Panel from '@/components/Chat/Panel.vue'
import ChatBubble from '@/components/Chat/ChatBubble.vue'
import { unWsLogout } from '@/api/ws'
import storage from '@/utils/storage'

export default {
  name: 'Book',
  components: {
    Tabbar,
    Panel,
    ChatBubble
  },
  data() {
    return {
      curSession: {
        name: '聊天室',
        type: 'user'
      },
      visitorId: '',
      users: {
        id: '',
        name: '',
        avatarUrl: ''
      },
      ChatInfo: [],
      messageData: [],
      timer: '',
      setting: {
        isName: true,
        isTime: true,
        isVoice: true
      }
    }
  },
  created() {
    this.visitorId = storage.get('visitor_id')
    this.users.id = this.visitorId
    this.users.name = storage.get('name')
    this.users.avatarUrl = storage.get('avatarUrl')
    if (!storage.get('name')) {
      fetch('https://api.codemao.cn/api/user/random/nickname').then(data => {
        return data.json()
      }).then(res => {
        storage.set('name', res.data.nickname)
        this.users.name = res.data.nickname
      })
    }
    if (!storage.get('avatarUrl')) {
      const avatarUrl = 'https://xsgames.co/randomusers/assets/avatars/pixel/' + Math.floor(Math.random() * 50 + 1) + '.jpg'
      storage.set('avatarUrl', avatarUrl)
      this.users.avatarUrl = avatarUrl
    }
    this.initSocket()
  },
  methods: {
    sendMessage(content, type) {
      const message = {
        group: 'chat',
        chat: {
          from: this.users,
          content: content,
          type: type,
          time: new Date().getTime()
        }
      }
      if (this.websock) {
        this.websocketsend(JSON.stringify(message))
      }
    },
    changeSession() {
      this.$router.push({ path: '/news' })
    },
    initSocket() {
      const ws = process.env.VUE_APP_BASE_WS_API === '' ? 'ws://' + window.location.hostname : process.env.VUE_APP_BASE_WS_API
      const wsurl = ws + '/ws/chat?token=' + this.visitorId
      this.websock = new WebSocket(wsurl)
      this.websock.onmessage = this.websocketonmessage
      this.websock.onopen = this.websocketonopen
      this.websock.onerror = this.websocketonerror
      this.websock.onclose = this.websocketclose
    },
    websocketonopen() { // 连接建立之后执行send方法发送数据
      this.timer = setInterval(() => {
        this.websocketsend('ping')
      }, 50000)
      console.log('连接打开')
    },
    websocketonerror() { // 连接建立失败重连
      console.log('连接失败')
    },
    websocketonmessage(e) { // 数据接收
      if (e.data === 'ping') {
        return
      }
      this.info = JSON.parse(e.data)
      if (!this.info.data) {
        return
      }
      if (this.info.type === 'message') {
        this.messageData.push(this.info.data)
        const vm = this
        setTimeout(() => {
          vm.scrollFooter('message-list')
        }, 16)
        return
      }
      if (this.info.type === 'info') {
        this.ChatInfo = this.info.data
        return
      }
      if (this.info.code === 200) {
        this.messageData = this.info.data
      }
    },
    scrollFooter(name) {
      const $el = this.$refs[name]
      if ($el) {
        this.$nextTick(() => {
          $el.scrollTop = $el.scrollHeight
        })
      }
    },
    websocketsend(Data) { // 数据发送
      this.websock.send(Data)
    },
    websocketclose(e) { // 关闭
      unWsLogout('chat', this.visitorId).then(response => {
        clearInterval(this.timer)
        console.log(response.data)
      })
      console.log('断开连接', e)
    }
  }
}

</script>

<style scoped>
.message-item:first-child{
  margin-top: 0;
}
.message-item{
  margin-top: 10px;
}
.iChat-message-warp{
  position: relative;
  width: 100%;
  height: 100%;
  overflow-y: auto;
}
.iChat-message-list{
  padding: 10px;
}
</style>
