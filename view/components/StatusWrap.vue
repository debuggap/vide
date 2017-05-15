<template>
  <div class="status-wrap">
    {{fileInfo}}
    <div class="sw-tool">
      <span>
        <el-button type="text" @click="setFontSize(-1)">-</el-button><el-button style="width:50px" type="text" @click="setFontSize(0)">{{fontSizePercent}}</el-button><el-button type="text" @click="setFontSize(1)">+</el-button>
      </span>
    </div>
	</div>
</template>

<script>
import Vue from 'vue'
import {Button} from 'element-ui'
import {changeFontSize, getFontSizePercent} from 'engine/editor'
import 'assets/css/status-wrap.scss'
import {mapState} from 'vuex'
Vue.use(Button)
export default {
  name: 'status-wrap',
  computed: {
    ...mapState({
      fileInfo: state => {
        if (state.editor.currentFile) {
          if (state.editor.fileType === 'text') {
            return state.editor.currentFile + ':' + state.editor.anchor.row + ':' + state.editor.anchor.column
          } else {
            return state.editor.currentFile
          }
        } else {
          return ''
        }
      },
      fontSizePercent: state => {
        return getFontSizePercent(state.config.editor.fontsize)
      }
    })
  },
  methods: {
    setFontSize (value) {
      let obj = changeFontSize(value)
      this.fontSizePercent = obj.percent
    }
  }
}

</script>