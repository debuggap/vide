<template>
  <div class="editor-function-desc" v-html="desc" v-if="desc" ref="editorFunctionDesc">
  </div>
</template>

<script>
import 'assets/css/editor/function-desc.scss'
import Signal from 'engine/signal'
export default {
  name: 'function-desc',
  data () {
    return {
      desc: null
    }
  },
  mounted () {
    Signal.receive('editor/setFunctionDesc', (item) => {
      // 如果值一样，就直接返回
      if (this.desc && item.desc === this.desc) {
        return
      }
      this.desc = item.desc
      if (this.desc) {
        this.$nextTick(() => {
          let x = item.position.x
          let y = item.position.y
          let left = x
          let top
          let boxHeight = this.$refs.editorFunctionDesc.clientHeight
          let boxWidth = this.$refs.editorFunctionDesc.clientWidth
          let contentWidth = document.querySelector('.content-view').clientWidth
          // 计算位置
          if (left + boxWidth > contentWidth) {
            left = contentWidth - boxWidth
          }
          if (boxHeight < y) {
            top = y - boxHeight - 10
          } else {
            top = y + 10
          }
          this.$refs.editorFunctionDesc.style.left = left + 'px'
          this.$refs.editorFunctionDesc.style.top = top + 'px'
        })
      }
    })
  }
}
</script>
