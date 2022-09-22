<template>
  <div class="cata-wrapper" :style="popupTheme">
    <div class="title">目录</div>
    <div
      ref="cataData"
      class="data-wrapper"
      :class="{ night: isNight, day: !isNight }"
    >
      <div class="cata">
        <div
          v-for="(note, i) in catalog"
          :key="note.durChapterIndex"
          ref="cata"
          class="log"
          :class="{ selected: isSelected(i) }"
          @click="gotoChapter(note)"
        >
          <div class="log-text">
            {{ note.Name }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import jump from '@/utils/book/jump'
import config from '@/utils/book/config'
import '@/assets/fonts/popfont.css'
export default {
  name: 'PopCata',
  data() {
    return {
      isNight: Number(this.$store.state.bookConfig.config.theme) === 6,
      index: this.$store.state.bookConfig.readingBook.index
    }
  },
  computed: {
    catalog() {
      return this.$store.state.bookConfig.readingBook.catalog
    },
    popCataVisible() {
      return this.$store.state.bookConfig.popCataVisible
    },
    theme() {
      return this.$store.state.bookConfig.config.theme
    },
    popupTheme() {
      return {
        background: config.themes[this.theme].popup
      }
    }
  },
  watch: {
    theme(theme) {
      this.isNight = Number(theme) === 6
    },
    popCataVisible() {
      this.$nextTick(function() {
        const index = this.$store.state.bookConfig.readingBook.index
        const wrapper = this.$refs.cataData
        jump(this.$refs.cata[index], { container: wrapper, duration: 0 })
      })
    }
  },
  mounted() {},
  methods: {
    isSelected(index) {
      return index === Number(this.$store.state.bookConfig.readingBook.index)
    },
    gotoChapter(note) {
      this.index = this.catalog.indexOf(note)
      this.$store.commit('bookConfig/setPopCataVisible', false)
      this.$store.commit('bookConfig/setContentLoading', true)
      this.$emit('getContent', this.index)
    }
  }
}
</script>

<style lang="scss" scoped>
.cata-wrapper {
  margin: -16px;
  padding: 18px 0 24px 25px;

  // background: #ede7da url('../assets/imgs/themes/popup_1.png') repeat;
  .title {
    font-size: 18px;
    font-weight: 400;
    font-family: FZZCYSK,serif;
    margin: 0 0 20px 0;
    color: #ed4259;
    width: fit-content;
    border-bottom: 1px solid #ed4259;
  }

  .data-wrapper {
    height: 300px;
    overflow: auto;

    .cata {
      display: flex;
      flex-direction: row;
      flex-wrap: wrap;
      justify-content: space-between;

      .selected {
        color: #EB4259;
      }

      .log {
        width: 50%;
        height: 40px;
        cursor: pointer;
        float: left;
        font: 16px / 40px PingFangSC-Regular, HelveticaNeue-Light, 'Helvetica Neue Light', 'Microsoft YaHei', sans-serif;

        .log-text {
          margin-right: 26px;
          overflow: hidden;
          white-space: nowrap;
          text-overflow: ellipsis;
        }
      }
    }
  }

  .night {
    >>>.log {
      border-bottom: 1px solid #666;
    }
  }

  .day {
    >>>.log {
      border-bottom: 1px solid #f2f2f2;
    }
  }
}

@media screen and (max-width: 500px) {
  .cata-wrapper .data-wrapper .cata .log {
  width: 100%;
  }
}
</style>
