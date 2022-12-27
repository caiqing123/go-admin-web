<script>
import { renderEmoji } from './emoji'
export default {
  name: 'EmojiText',
  props: {
    text: {
      type: String,
      default: ''
    }
  },
  render(h) {
    return renderEmoji(this.text, h)
  }
}
</script>
