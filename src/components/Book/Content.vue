<script>
import config from '@/utils/book/config'
export default {
  name: 'Pcontent',
  props: {
    carray: {
      type: Array,
      required: true
    }
  },
  data() {
    return {}
  },
  computed: {
    show() {
      return this.$store.state.bookConfig.showContent
    },
    fontFamily() {
      if (this.$store.state.bookConfig.config.font >= 0) {
        return config.fonts[this.$store.state.bookConfig.config.font]
      }
      return { fontFamily: this.$store.state.bookConfig.config.customFontName }
    },
    fontSize() {
      return this.$store.state.bookConfig.config.fontSize + 'px'
    }
  },
  watch: {
    fontSize() {
      const that = this
      that.$store.commit('bookConfig/setShowContent', false)
      this.$nextTick(() => {
        that.$store.commit('bookConfig/setShowContent', true)
      })
    }
  },
  mounted() {

  },
  render() {
    const { fontFamily, fontSize } = this
    const style = fontFamily
    style.fontSize = fontSize
    if (this.show) {
      return (
        <div>
          {this.carray.map((a) => {
            if (/<img[^>]*src/.test(a)) {
              const imgPattern = /<img[^>]*src="([^"]*(?:"[^>]+})?)"[^>]*>/g
              a.match(imgPattern).map((i) => {
                const img = i.match(/<img[^>]*src="([^"]*(?:"[^>]+})?)"[^>]*>/)[1]
                a = a.replace(i, '<img style="width: 100%;display:block;" src=' + img + ' />')
              })
            }

            return <p style={style} domPropsInnerHTML={a} />
          })}
        </div>
      )
    } else {
      return <div />
    }
  }
}
</script>

<style scoped>
p {
  display: block;
  word-wrap: break-word;
  word-break: break-all;
}
img {
  margin-left:auto;
  margin-right:auto;
  display:block;
  width:100%;
}
</style>
