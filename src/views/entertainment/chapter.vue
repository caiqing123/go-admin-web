<template>
  <div
    class="chapter-wrapper"
    :style="bodyTheme"
    :class="{ night: isNight, day: !isNight }"
    @click="showToolBar = !showToolBar"
  >
    <div class="tool-bar" :style="leftBarTheme">
      <div class="tools">
        <el-popover
          v-model="popCataVisible"
          trigger="click"
          placement="bottom"
          :visible-arrow="false"
          popper-class="pop-cata"
        >
          <PopCata ref="popCata" class="popup" @getContent="getContent" />

          <div
            slot="reference"
            class="tool-icon"
            :class="{ 'no-point': noPoint }"
          >
            <div class="iconfont">&#58905;</div>
            <div class="icon-text">目录</div>
          </div>
        </el-popover>
        <el-popover
          v-model="readSettingsVisible"
          trigger="click"
          placement="bottom"
          :visible-arrow="false"
          popper-class="pop-setting"
        >
          <ReadSettings class="popup" />

          <div
            slot="reference"
            class="tool-icon"
            :class="{ 'no-point': noPoint }"
          >
            <div class="iconfont">&#58971;</div>
            <div class="icon-text">设置</div>
          </div>
        </el-popover>
        <div class="tool-icon" @click="toShelf">
          <div class="iconfont">&#58892;</div>
          <div class="icon-text">书架</div>
        </div>
        <div class="tool-icon" :class="{ 'no-point': noPoint }" @click="toTop">
          <div class="iconfont">&#58914;</div>
          <div class="icon-text">顶部</div>
        </div>
        <div
          class="tool-icon"
          :class="{ 'no-point': noPoint }"
          @click="toBottom"
        >
          <div class="iconfont">&#58915;</div>
          <div class="icon-text">底部</div>
        </div>
      </div>
    </div>
    <div class="read-bar" :style="rightBarTheme">
      <div class="tools">
        <div
          class="tool-icon"
          :class="{ 'no-point': noPoint }"
          @click="toPreChapter"
        >
          <div class="iconfont">&#58920;</div>
          <span v-if="$store.state.miniInterface">上一章</span>
        </div>
        <div
          class="tool-icon"
          :class="{ 'no-point': noPoint }"
          @click="toNextChapter"
        >
          <span v-if="$store.state.miniInterface">下一章</span>
          <div class="iconfont">&#58913;</div>
        </div>
      </div>
    </div>
    <div class="chapter-bar" />
    <div ref="content" class="chapter" :style="chapterTheme">
      <div class="content">
        <div ref="top" class="top-bar" />
        <div v-for="data in chapterData" :key="data.index" ref="chapter">
          <div v-if="show" ref="title" class="title">{{ data.title }}</div>
          <Pcontent :carray="data.content" />
        </div>
        <div ref="loading" class="loading" />
        <div ref="bottom" class="bottom-bar" />
      </div>
    </div>
  </div>
</template>

<script>
import PopCata from '@/components/Book/PopCatalog.vue'
import ReadSettings from '@/components/Book/ReadSettings.vue'
import Pcontent from '@/components/Book/Content.vue'
import jump from '@/utils/book/jump'
import config from '@/utils/book/config'
import storage from '@/utils/storage'
import { getBookChapter, getBookInfo } from '@/api/monitor/server'

export default {
  components: {
    PopCata,
    Pcontent,
    ReadSettings
  },
  data() {
    return {
      noPoint: true,
      showToolBar: false,
      chapterData: [],
      scrollObserve: null,
      readingObserve: null,
      chapterIndex: 0
    }
  },
  computed: {
    catalog() {
      return this.$store.state.bookConfig.catalog
    },
    windowHeight() {
      return window.innerHeight
    },
    contentHeight() {
      return this.$refs.content.offsetHeight
    },
    popCataVisible: {
      get() {
        return this.$store.state.bookConfig.popCataVisible
      },
      set(value) {
        this.$store.commit('bookConfig/setPopCataVisible', value)
      }
    },
    readSettingsVisible: {
      get() {
        return this.$store.state.bookConfig.readSettingsVisible
      },
      set(value) {
        this.$store.commit('bookConfig/setReadSettingsVisible', value)
      }
    },
    config() {
      return this.$store.state.bookConfig.config
    },
    theme() {
      return this.config.theme
    },
    bodyColor() {
      return config.themes[this.config.theme].body
    },
    chapterColor() {
      return config.themes[this.config.theme].content
    },
    popupColor() {
      return config.themes[this.config.theme].popup
    },
    isNight() {
      return Number(this.$store.state.bookConfig.config.theme) === 6
    },
    readWidth() {
      if (!this.$store.state.bookConfig.miniInterface) {
        return this.$store.state.bookConfig.config.readWidth - 130 + 'px'
      } else {
        return window.innerWidth + 'px'
      }
    },
    bodyTheme() {
      return {
        background: config.themes[this.$store.state.bookConfig.config.theme].body
      }
    },
    chapterTheme() {
      return {
        background: config.themes[this.$store.state.bookConfig.config.theme].content,
        width: this.readWidth
      }
    },
    leftBarTheme() {
      return {
        background: config.themes[this.$store.state.bookConfig.config.theme].popup,
        marginLeft: this.$store.state.bookConfig.miniInterface
          ? 0
          : -(this.$store.state.bookConfig.config.readWidth / 2 + 68) + 'px',
        display:
          this.$store.state.bookConfig.miniInterface && !this.showToolBar
            ? 'none'
            : 'block'
      }
    },
    rightBarTheme() {
      return {
        background: config.themes[this.$store.state.bookConfig.config.theme].popup,
        marginRight: this.$store.state.bookConfig.miniInterface
          ? 0
          : -(this.$store.state.bookConfig.config.readWidth / 2 + 52) + 'px',
        display:
          this.$store.state.bookConfig.miniInterface && !this.showToolBar
            ? 'none'
            : 'block'
      }
    },
    show() {
      return this.$store.state.bookConfig.showContent
    },
    enableInfiniteLoading() {
      return this.$store.state.bookConfig.config.infiniteLoading
    }
  },
  watch: {
    chapterData() {
      this.$store.commit('bookConfig/setContentLoading', false)
      // 添加章节内容到observe
      this.addReadingObserve()
    },
    chapterIndex(index) {
      this.saveReadingBookProgress(index)
    },
    theme(theme) {
      this.isNight = Number(theme) === 6
    },
    bodyColor(color) {
      this.bodyTheme.background = color
    },
    chapterColor(color) {
      this.chapterTheme.background = color
    },
    readWidth(width) {
      this.chapterTheme.width = width
      const leftToolMargin = -((parseInt(width) + 130) / 2 + 68) + 'px'
      const rightToolMargin = -((parseInt(width) + 130) / 2 + 52) + 'px'
      this.leftBarTheme.marginLeft = leftToolMargin
      this.rightBarTheme.marginRight = rightToolMargin
    },
    popupColor(color) {
      this.leftBarTheme.background = color
      this.rightBarTheme.background = color
    },
    readSettingsVisible(visible) {
      /*
      if (!visible) {
        let configText = JSON.stringify(this.$store.state.bookConfig.config);
        localStorage.setItem("config", configText);
      }
      */
    },
    enableInfiniteLoading(enable) {
      if (!enable) {
        this.scrollObserve.disconnect()
      } else {
        this.scrollObserve.observe(this.$refs.loading)
      }
    }
  },
  created() {
    const config = JSON.parse(localStorage.getItem('config'))
    if (config != null) this.$store.commit('bookConfig/setConfig', config)
  },
  beforeCreate() {
    const config = JSON.parse(localStorage.getItem('config'))
    if (config != null) this.$store.commit('bookConfig/setConfig', config)
  },
  mounted() {
    this.loading = this.$loading({
      target: this.$refs.content,
      lock: true,
      text: '正在获取内容',
      spinner: 'el-icon-loading',
      background: 'rgba(0,0,0,0)'
    })
    // 获取书籍数据
    const that = this

    if (this.$route.query.cacheLoadURL) {
      fetch(this.$route.query.cacheLoadURL)
        .then((response) => {
          return response.json()
        })
        .then((myBlob) => {
          const bookUrl = sessionStorage.getItem('bookUrl')
          let book = JSON.parse(localStorage.getItem(bookUrl))
          if (book == null) {
            book = {
              bookName: myBlob.BookName,
              bookUrl: myBlob.BookURL,
              index: 0
            }
            localStorage.setItem(myBlob.BookURL, JSON.stringify(book))
            sessionStorage.setItem('bookUrl', myBlob.BookURL)
          }
          sessionStorage.setItem('bookName', myBlob.BookName)
          book.catalog = myBlob.Volumes[0].Chapters
          that.$store.commit('bookConfig/setReadingBook', book)
          const index = that.$store.state.bookConfig.readingBook.index || 0
          this.getContent(index)
          window.addEventListener('keyup', this.handleKeyPress)
          // 监听底部加载
          this.scrollObserve = new IntersectionObserver(
            this.handleIScrollObserve,
            { rootMargin: '-100% 0% 20% 0%' }
          )
          this.enableInfiniteLoading &&
          this.scrollObserve.observe(this.$refs.loading)
          // 监听当前阅读章节
          this.readingObserve = new IntersectionObserver(
            this.handleIReadingObserve
          )
        })
        .catch((error) => {
          console.log(error)
          that.loading.close()
          that.$message.error('获取书籍目录失败')
        })
    } else {
      getBookInfo({ url: this.$route.query.url, visitorId: storage.get('visitor_id') }).then(
        (res) => {
          const bookUrl = sessionStorage.getItem('bookUrl')
          let book = JSON.parse(localStorage.getItem(bookUrl))
          if (book == null) {
            book = {
              bookName: res.data.BookName,
              bookUrl: res.data.BookURL,
              index: 0
            }
            localStorage.setItem(res.data.BookURL, JSON.stringify(book))
            sessionStorage.setItem('bookUrl', res.data.BookURL)
          }
          sessionStorage.setItem('bookName', res.data.BookName)
          book.catalog = res.data.Volumes[0].Chapters
          that.$store.commit('bookConfig/setReadingBook', book)
          const index = that.$store.state.bookConfig.readingBook.index || 0
          this.getContent(index)
          window.addEventListener('keyup', this.handleKeyPress)
          // 监听底部加载
          this.scrollObserve = new IntersectionObserver(
            this.handleIScrollObserve,
            { rootMargin: '-100% 0% 20% 0%' }
          )
          this.enableInfiniteLoading &&
          this.scrollObserve.observe(this.$refs.loading)
          // 监听当前阅读章节
          this.readingObserve = new IntersectionObserver(
            this.handleIReadingObserve
          )
        },
        (err) => {
          that.loading.close()
          that.$message.error('获取书籍目录失败')
          throw err
        }
      )
    }
  },
  destroyed() {
    window.removeEventListener('keyup', this.handleKeyPress)
    this.readSettingsVisible = false
    this.popCataVisible = false
    this.scrollObserve && this.scrollObserve.disconnect()
    this.readingObserve && this.readingObserve.disconnect()
  },
  methods: {
    getContent(index, reloadChapter = true) {
      if (reloadChapter) {
        // 展示进度条
        this.$store.commit('bookConfig/setShowContent', false)
        if (!this.loading.visible) {
          this.loading = this.$loading({
            target: this.$refs.content,
            lock: true,
            text: '正在获取内容',
            spinner: 'el-icon-loading',
            background: 'rgba(0,0,0,0)'
          })
        }
        // 强制滚回顶层
        jump(this.$refs.top, { duration: 0 })
        // 保存进度
        this.saveReadingBookProgress(index)
      }
      const title = this.$store.state.bookConfig.readingBook.catalog[index].Name
      if (this.$store.state.bookConfig.readingBook.catalog[index].Text) {
        const content = this.$store.state.bookConfig.readingBook.catalog[index].Text
        this.updateChapterData({ index, content, title }, reloadChapter)
        this.$store.commit('bookConfig/setContentLoading', true)
        this.loading.close()
        this.noPoint = false
        this.$store.commit('bookConfig/setShowContent', true)
      } else {
        const that = this
        getBookChapter({
          url: that.$store.state.bookConfig.readingBook.catalog[index].URL,
          visitorId: storage.get('visitor_id')
        }).then(
          (res) => {
            const content = res.data
            that.updateChapterData({ index, content, title }, reloadChapter)
            that.$store.commit('bookConfig/setContentLoading', true)
            that.loading.close()
            that.noPoint = false
            that.$store.commit('bookConfig/setShowContent', true)
          },
          (err) => {
            that.$message.error('获取章节内容失败')
            const content = ['获取章节内容失败！']
            that.updateChapterData({ index, content, title }, reloadChapter)
            that.loading.close()
            that.$store.commit('bookConfig/setShowContent', true)
            throw err
          }
        )
      }
    },
    toTop() {
      jump(this.$refs.top)
    },
    toBottom() {
      jump(this.$refs.bottom)
    },
    toNextChapter() {
      this.$store.commit('bookConfig/setContentLoading', true)
      let index = this.$store.state.bookConfig.readingBook.index
      index++
      if (typeof this.$store.state.bookConfig.readingBook.catalog[index] !== 'undefined') {
        this.getContent(index)
      } else {
        this.$message.error('本章是最后一章')
      }
    },
    toPreChapter() {
      this.$store.commit('bookConfig/setContentLoading', true)
      let index = this.$store.state.bookConfig.readingBook.index
      index--
      if (typeof this.$store.state.bookConfig.readingBook.catalog[index] !== 'undefined') {
        this.getContent(index)
      } else {
        this.$message.error('本章是第一章')
      }
    },
    saveReadingBookProgress(index) {
      const bookUrl = sessionStorage.getItem('bookUrl')
      const book = JSON.parse(localStorage.getItem(bookUrl))
      book.index = index
      localStorage.setItem(bookUrl, JSON.stringify(book))
      this.$store.state.bookConfig.readingBook.index = index
      sessionStorage.setItem('chapterIndex', index)
      const title = this.$store.state.bookConfig.readingBook.catalog[index].Name
      document.title = sessionStorage.getItem('bookName') + ' | ' + title
    },
    updateChapterData(data, reloadChapter) {
      if (reloadChapter) {
        this.chapterData.splice(0)
      }
      this.chapterData.push(data)
    },
    loadMore() {
      const index = this.chapterData.slice(-1)[0].index
      if (this.$store.state.bookConfig.readingBook.catalog.length - 1 > index) {
        this.getContent(index + 1, false)
      }
    },
    toShelf() {
      this.$message.info('未开放')
    },
    // 监听方向键
    handleKeyPress(event) {
      switch (event.key) {
        case 'ArrowLeft':
          event.stopPropagation()
          event.preventDefault()
          this.toPreChapter()
          break
        case 'ArrowRight':
          event.stopPropagation()
          event.preventDefault()
          this.toNextChapter()
          break
        case 'ArrowUp':
          event.stopPropagation()
          event.preventDefault()
          if (document.documentElement.scrollTop === 0) {
            this.$message.warning('已到达页面顶部')
          } else {
            jump(0 - document.documentElement.clientHeight + 100)
          }
          break
        case 'ArrowDown':
          event.stopPropagation()
          event.preventDefault()
          if (
            document.documentElement.clientHeight +
            document.documentElement.scrollTop ===
            document.documentElement.scrollHeight
          ) {
            this.$message.warning('已到达页面底部')
          } else {
            jump(document.documentElement.clientHeight - 100)
          }
          break
      }
    },
    // IntersectionObserver回调 底部加载
    handleIScrollObserve(entries) {
      if (this.loading.visible) return
      for (const { isIntersecting } of entries) {
        if (!isIntersecting) return
        this.loadMore()
      }
    },
    // IntersectionObserver回调 当前阅读章节序号
    handleIReadingObserve(entries) {
      setTimeout(() => {
        for (const { isIntersecting, target, boundingClientRect } of entries) {
          if (target.querySelector('.title') === null) return
          const title = target.querySelector('.title').innerText
          const catalog = this.$store.state.bookConfig.readingBook.catalog
          const chapter = catalog.findIndex(
            (item) => item.Name.replace(/\s/g, '') === title.replace(/\s/g, '')
          )
          if (chapter === undefined) return
          if (isIntersecting) {
            this.chapterIndex = chapter
          } else {
            if (boundingClientRect.top < 0) {
              this.chapterIndex = chapter + 1
            } else {
              this.chapterIndex = chapter - 1
            }
          }
        }
      }, 50)
    },
    // 添加所有章节到observe
    addReadingObserve() {
      setTimeout(() => {
        const chapterElements = this.$refs.chapter
        if (!chapterElements) return
        chapterElements.forEach((el) => this.readingObserve.observe(el))
      }, 10)
    }
  }
}
</script>

<style lang="scss" scoped>
> > > .pop-setting {
  margin-left: 10px;
}

> > > .pop-cata {
  margin-left: 10px;
}

> > > .scroll-container {
  overflow-y: hidden !important;
}

.chapter-wrapper {
  padding: 0 4%;
  flex-direction: column;
  align-items: center;

  > > > .no-point {
    pointer-events: none;
  }

  .tool-bar {
    position: fixed;
    top: 0;
    left: 50%;
    z-index: 100;

    .tools {
      display: flex;
      flex-direction: column;

      .tool-icon {
        font-size: 18px;
        width: 58px;
        height: 48px;
        text-align: center;
        padding-top: 12px;
        cursor: pointer;
        outline: none;

        .iconfont {
          font-family: iconfont,serif;
          width: 16px;
          height: 16px;
          font-size: 16px;
          margin: 0 auto 6px;
        }

        .icon-text {
          font-size: 12px;
        }
      }
    }
  }

  .read-bar {
    position: fixed;
    bottom: 0;
    right: 50%;
    z-index: 100;

    .tools {
      display: flex;
      flex-direction: column;

      .tool-icon {
        font-size: 18px;
        width: 42px;
        height: 31px;
        padding-top: 12px;
        text-align: center;
        align-items: center;
        cursor: pointer;
        outline: none;
        margin-top: -1px;

        .iconfont {
          font-family: iconfont,serif;
          width: 16px;
          height: 16px;
          font-size: 16px;
          margin: 0 auto 6px;
        }
      }
    }
  }

  .chapter-bar {
    .el-breadcrumb {
      .item {
        font-size: 14px;
        color: #606266;
      }
    }
  }

  .chapter {
    font-family: 'Microsoft YaHei', PingFangSC-Regular, HelveticaNeue-Light, 'Helvetica Neue Light', sans-serif;
    text-align: left;
    padding: 0 65px;
    min-height: 100vh;
    width: 670px;
    margin: 0 auto;

    > > > .el-icon-loading {
      font-size: 36px;
      color: #B5B5B5;
    }

    > > > .el-loading-text {
      font-weight: 500;
      color: #B5B5B5;
    }

    .content {
      font-size: 18px;
      line-height: 1.8;
      overflow: hidden;
      font-family: 'Microsoft YaHei', PingFangSC-Regular, HelveticaNeue-Light, 'Helvetica Neue Light', sans-serif;

      .title {
        margin-bottom: 57px;
        font: 24px / 32px PingFangSC-Regular, HelveticaNeue-Light, 'Helvetica Neue Light', 'Microsoft YaHei', sans-serif;
      }

      .bottom-bar, .top-bar {
        height: 64px;
      }
    }
  }
}

.day {
  > > > .popup {
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.12), 0 0 6px rgba(0, 0, 0, 0.04);
  }

  > > > .tool-icon {
    border: 1px solid rgba(0, 0, 0, 0.1);
    margin-top: -1px;
    color: #000;

    .icon-text {
      color: rgba(0, 0, 0, 0.4);
    }
  }

  > > > .chapter {
    border: 1px solid #d8d8d8;
    color: #262626;
  }
}

.night {
  > > > .popup {
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.48), 0 0 6px rgba(0, 0, 0, 0.16);
  }

  > > > .tool-icon {
    border: 1px solid #444;
    margin-top: -1px;
    color: #666;

    .icon-text {
      color: #666;
    }
  }

  > > > .chapter {
    border: 1px solid #444;
    color: #666;
  }

  > > > .popper__arrow {
    background: #666;
  }
}

@media screen and (max-width: 750px) {
  .chapter-wrapper {
    padding: 0;

    .tool-bar {
      line-height: 10px;
      height: 50px;
      left: 0;
      width: 100vw;
      margin-left: 0 !important;

      .tools {
        flex-direction: row;
        justify-content: space-between;

        .tool-icon {
          border: none;
        }
      }
    }

    .read-bar {
      line-height: 18px;
      height: 36px;
      right: 0;
      width: 100vw;
      margin-right: 0 !important;

      .tools {
        flex-direction: row;
        justify-content: space-between;
        padding: 0 15px;

        .tool-icon {
          border: none;
          width: auto;

          .iconfont {
            display: inline-block;
          }
        }
      }
    }

    .chapter {
      width: 100vw !important;
      padding: 0 20px;
      box-sizing: border-box;
    }
  }
}
</style>
