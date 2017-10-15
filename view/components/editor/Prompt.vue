<template>
<div>
  <div class="editor-prompt-box" v-show="lists.length">
    <ul>
      <li @click="select(index)" :key="index" v-for="(list, index) in lists" :class="{active: index === currentIndex}"><span class="editor-prompt-box-value" v-html="highlight(list)"></span><span v-if="list.info && index === currentIndex" class="editor-prompt-box-tip">{{list.info}}</span></li>
    </ul>
    <div class="editor-prompt-box-bottom">Use `esc` to close</div>
  </div>
  <div v-if="params" class="editor-prompt-params">
    <span class="editor-prompt-params-box">
      <span v-for="(param, index) in params" :class="{active: index === paramIndex}">{{param}}</span>
    </span>
  </div>
</div>
</template>

<script>
import 'assets/css/editor/prompt.scss'
import $ from 'jquery'
import {mapState} from 'vuex'
import store from 'store'
import {editor} from 'engine/editor'
import Signal from 'engine/signal'

let ulDom = null
let typedStrReg = null
function calculateScrollTop () {
  let current = $('.editor-prompt-box li.active')
  let index = current.index()
  let totalOffsetHeight = index * current[0].clientHeight
  index = Math.floor(totalOffsetHeight / ulDom.clientHeight)
  ulDom.scrollTop = index * ulDom.clientHeight
}
function setPromptPosition () {
  let dom = $('#editor .ace_cursor')[0]
  let wrapDom = $('.content')[0]
  let x = 0
  let y = dom.clientHeight
  let cursorHeight = y
  while (dom !== wrapDom) {
    x += dom.offsetLeft
    y += dom.offsetTop
    dom = dom.offsetParent
  }
  let editorDom = $('#editor')[0]
  let promptBoxDom = $('.editor-prompt-box')[0]
  if (x + promptBoxDom.clientWidth > editorDom.clientWidth) {
    x = editorDom.clientWidth - promptBoxDom.clientWidth
  }
  if (y + promptBoxDom.clientHeight > editorDom.clientHeight) {
    y -= cursorHeight + promptBoxDom.clientHeight + 3
  }
  $('.editor-prompt-box').css({left: x + 'px', top: y + 'px'})
  $('.editor-prompt-box-bottom')[0].focus()
}

function setParamsPosition () {
  let _editor = editor()
  _editor.selection.moveCursorBy(0, -1)
  let offset = document.querySelector('.ace_cursor').getBoundingClientRect()
  let width = $('.editor-prompt-params')[0].clientWidth
  let left
  let top
  let documentWidth = document.documentElement.clientWidth
  left = offset.left - 10
  top = offset.top - _editor.renderer.layerConfig.lineHeight
  if (left + width > documentWidth) {
    left = documentWidth - width - 10
  }
  $('.editor-prompt-params').css({
    left,
    top
  })
}

export default {
  name: 'prompt',
  data () {
    return {
      currentIndex: 0,
      params: null,
      paramIndex: 0
    }
  },
  computed: {
    ...mapState({
      lists: state => state.editor.promptLists,
      typedStr: state => state.editor.promptStr
    })
  },
  watch: {
    lists () {
      if (this.lists.length) {
        this.currentIndex = 0
        this.$nextTick(() => {
          setPromptPosition()
        })
      }
    },
    typedStr () {
      if (this.typedStr) {
        typedStrReg = new RegExp(this.typedStr, 'i')
      }
    }
  },
  methods: {
    selectPrev () {
      let index = this.currentIndex
      index--
      if (index < 0) {
        index = this.lists.length - 1
      }
      this.currentIndex = index
    },
    selectNext () {
      let index = this.currentIndex
      index++
      if (index >= this.lists.length) {
        index = 0
      }
      this.currentIndex = index
    },
    keyup (e) {
      if (!this.params) {
        return
      }
      if ([27].includes(e.keyCode)) {
        this.closePromptParams()
      } else if (e.keyCode === 188) {
        this.paramIndex++
        this.setParamByIndex(this.paramIndex)
      } else if (e.keyCode === 39) {
        let _editor = editor()
        let pos = _editor.getCursorPosition()
        if (this.paramIndex === this.params.length - 1 || _editor.session.getLine(pos.row)[pos.column - 1] === ')') {
          this.closePromptParams()
        }
      }
    },
    keydown (e) {
      if (!this.lists.length) {
        return
      }
      let needPrevent = 0
      if (e.keyCode === 38) {
        this.selectPrev()
        needPrevent = 1
      } else if (e.keyCode === 40) {
        this.selectNext()
        needPrevent = 1
      } else if (e.keyCode === 39) {
        this.closePromptLists()
        needPrevent = 1
      } else if (e.keyCode === 27) {
        this.close()
        needPrevent = 1
      }
      if (needPrevent) {
        e.preventDefault()
        e.stopPropagation()
      }
    },
    keypress (e) {
      if (!this.lists.length && !this.params) {
        return
      }
      let needPrevent = 0
      if (e.keyCode === 13) {
        if (this.lists.length) {
          needPrevent = 1
          this.select()
        }
        this.close()
      }
      if (needPrevent) {
        e.preventDefault()
        e.stopPropagation()
      }
    },
    close () {
      this.closePromptLists()
      this.closePromptParams()
      typedStrReg = null
    },
    closePromptLists () {
      store.dispatch('editor/cleanPromptLists')
    },
    closePromptParams () {
      this.params = null
    },
    select (index) {
      index = index || this.currentIndex
      let item = this.lists[index]
      if (item) {
        let _editor = editor()
        let range = _editor.selection.getRange()
        // 用户删除之前的已经输出的字符串
        range.start.column -= this.typedStr.length
        // 获取当前行内容
        let currentLine = _editor.session.getLine(range.start.row)
        let column = currentLine.match(/^\s*/)[0].length
        // 需要替换的值
        let replaceValue = item.value ? item.value : (item.name ? item.name : item)
        // 如果位置不在行开头,添加的是`block`值，增加相应的移动位置
        if (column && /\n/.test(replaceValue)) {
          let tabCount = column / store.state.config.editor.tabsize
          tabCount = Math.round(tabCount)
          if (tabCount) {
            replaceValue = replaceValue.replace(/\n/g, function () {
              return '\n' + new Array(tabCount).fill('\t').join('')
            })
            let v = new Array(store.state.config.editor.tabsize).fill(' ').join('')
            replaceValue = replaceValue.replace(/\t/g, v)
          }
        }
        _editor.session.replace(range, replaceValue)
        // move cursor if needed
        if (item.moveAction) {
          setTimeout(() => {
            let vertical = item.moveAction[0]
            vertical && (vertical < 0 ? _editor.navigateUp(Math.abs(vertical)) : _editor.navigateDown(vertical))
            let horizontal = item.moveAction[1]
            horizontal && (horizontal < 0 ? _editor.navigateLeft(Math.abs(horizontal)) : _editor.navigateRight(horizontal))
          }, 100)
        }
        // show params
        if (item.value && item.params && item.params.length) {
          // editor的替换都是异步的,先同步异步显示参数，在设置params，用nextTick
          setTimeout(() => {
            this.params = item.params
            this.paramIndex = 0
            this.$nextTick(() => {
              // set params box position
              setParamsPosition()
              // set params
              this.setParamByIndex(0)
            })
          }, 100)
        } else {
          this.params = null
          this.paramIndex = 0
        }
        // focus editor
        _editor.focus()
      }
      // close prompt box
      this.closePromptLists()
    },
    highlight (item) {
      let value = item.name || item.value || item
      value = value.replace(/\((.*)\)/, function (a, b) { return '(' + '<span class="prompt-function-params">' + b + '</span>' + ')' })
      return value.replace(typedStrReg, (m) => {
        return `<b>${m}</b>`
      })
    },
    setParamByIndex (index) {
      if (this.params && this.params[index]) {
        let param = this.params[index]
        let _editor = editor()
        // if param is not the first one, add space
        if (index !== 0) {
          _editor.insert(' ')
        }
        _editor.insert(param)
        let range = _editor.selection.getRange()
        range.start.column -= param.length
        _editor.selection.setRange(range)
      } else {
        // close params
        this.closePromptParams()
      }
    }
  },
  mounted () {
    ulDom = $('.editor-prompt-box ul')[0]
    document.body.addEventListener('keydown', this.keydown, true)
    document.body.addEventListener('keyup', this.keyup, true)
    document.body.addEventListener('keypress', this.keypress, true)
    Signal.receive('saveFile|editor/changeScroll', () => {
      this.close()
    })
  },
  updated () {
    if (this.lists.length) {
      calculateScrollTop()
    }
  }
}
</script>