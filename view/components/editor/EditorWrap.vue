<template>
  <div class="content">
    <div class="content-view">
      <div id="editor" class="editor-base" @contextmenu="contextmenu" ref="editor"></div>
      <prompt></prompt>
      <function-desc></function-desc>
      <media-detail v-if="fileType === 'media'" :currentFile="currentFile"></media-detail>
      <search-result v-show="fileType === 'search'"></search-result>
    </div>
    <search v-if="showSearchBox"></search>
  </div>
</template>

<script>
import ace from 'ace'
import path from 'path'
import Prompt from './Prompt'
import Search from './Search'
import MediaDetail from './MediaDetail'
import SearchResult from './SearchResult'
import FunctionDesc from './FunctionDesc'
import {mapState} from 'vuex'
import 'assets/css/editor/editor-wrap.scss'
import store from 'store'
import {showMenu} from 'engine/menu'
import lanObject from 'engine/language'
import {runPackageEvent} from 'engine/package'
import {runInternalEvent} from 'engine/event'
import {showPrompt} from 'engine/prompt'
import {setEditor} from 'engine/editor'
import {getFileModeByContent} from 'engine/file_mode'
import {openExternal} from 'engine/native'
import Signal from 'engine/signal'
import debounce from 'lodash/debounce'
import {getLastModify, getFileContent} from 'engine/helper/file_helper'
import {confirm} from 'engine/message_box'

// 变量
let editor = null
let session = null
let isChangingFile = false
const basicMenu = [
  {name: lanObject.common.copy, func: 'navEvent.copy', bindKey: { win: 'Ctrl-c', mac: 'Command-c' }},
  {name: lanObject.common.cut, func: 'navEvent.cut', bindKey: { win: 'Ctrl-x', mac: 'Command-x' }},
  {name: lanObject.common.paste, func: 'navEvent.paste', bindKey: { win: 'Ctrl-v', mac: 'Command-v' }}, '|'
]

// listen event from editor,so that ide could broadcast this events
function listenEventFromEditor (editor, session) {
  session.on('change', (action) => {
    if (isChangingFile && action.action === 'insert') {
    } else if (!isChangingFile) {
      if (this.currentFile) {
        let lists = store.state.resourceRecent.lists
        if (!lists.includes(this.currentFile)) {
          // add new item to recent lists and also record scroll info
          store.dispatch('resourceRecent/addItem', this.currentFile)
          store.dispatch('scrollFile', {filepath: this.currentFile, scroll: {top: session.getScrollTop(), left: session.getScrollLeft()}})
        }
        // modify current file
        store.dispatch('editingFile', {filepath: this.currentFile, con: editor.getValue(), undoManager: session.$undoManager})
        // show prompt
        showPrompt(action)
      } else {
        // we are editing empty file,this happens when ide launches
        store.dispatch('createNewFile', {con: editor.getValue()})
        // move to last position
        setTimeout(function () {
          editor.moveCursorTo(10000, 10000)
        }, 10)
      }
    }
  })
  // set anchor position
  editor.selection.on('changeCursor', function (event, selection) {
    store.dispatch('anchorPosition', editor.getCursorPosition())
  })
  // 使用debounce来延迟设置值
  editor.session.on('changeScrollTop', debounce((top) => {
    store.dispatch('scrollFile', {filepath: this.currentFile, scroll: {top: top}})
    // 发送scroll事件，可以在滚动时，调用一些函数
    Signal.send('editor/changeScroll')
  }, 500))
  editor.session.on('changeScrollLeft', debounce((left) => {
    store.dispatch('scrollFile', {filepath: this.currentFile, scroll: {left: left}})
    Signal.send('editor/changeScroll')
  }, 500))
  editor.on('paste', function (event) {
    let currentContent = editor.getValue()
    let basename = path.basename(store.state.editor.currentFile)
    if (!currentContent && event.text && !basename.includes('.')) {
      let fileMode = getFileModeByContent(event.text)
      if (!fileMode) {
        fileMode = 'text'
      }
      session.setMode('ace/mode/' + fileMode)
    }
  })
}

// show contextmenu for editor selection
function showContextMenu (event) {
  let lists = []
  // if currentFile is not untitled file, add following
  if (store.state.editor.currentFile && !/^untitled/.test(store.state.editor.currentFile)) {
    lists.push({name: lanObject.editorContextMenu.copyFilePath, func: 'editorEvent.copyPath'})
    lists.push({name: lanObject.resourceTree.showInFolder, func: 'editorEvent.revealPath'})
  }
  // concat lists
  lists = basicMenu.concat(lists)
  // load external menu from plugin
  try {
    lists = lists.concat(store.state.extmenu.editorContext)
  } catch (e) {}
  showMenu(lists, {x: event.x, y: event.y, container: document.querySelector('.ace_scroller')}, (item) => {
    let func = item.func
    if (func.indexOf(':') !== -1) {
      runPackageEvent(func, [item])
    } else if (func.indexOf('.') !== -1) {
      runInternalEvent(func)
    }
  })
}

/*
* ****************************************
*               export
* ****************************************
*/
export default {
  name: 'editor-wrap',
  computed: {
    ...mapState({
      currentFile: state => state.editor.currentFile,
      content: state => state.editor.content,
      fileMode: state => state.editor.fileMode,
      fileType: state => state.editor.fileType,
      fileStatus: state => state.resourceRecent.currentFiles[state.editor.currentFile],
      showSearchBox: state => state.search.showSearchBox,
      showSearchResult: state => state.search.showSearchResult,
      projectPath: state => state.projectPath
    })
  },
  watch: {
    projectPath () {
      if (this.projectPath) {
        setEditor()
      }
    },
    currentFile () {
      // 当文件改变时，重新设置显示内容
      if (this.fileType === 'text') {
        isChangingFile = true
        session.setValue(this.content)
        session.setMode('ace/mode/' + this.fileMode)
        editor.focus()
        isChangingFile = false
        // 当文件是修改状态时，进行检查更新
        if (this.fileStatus && this.fileStatus.status === 'M') {
          this.checkContentUpdate()
        }
      } else if (this.fileType === 'system') {
        openExternal(this.currentFile)
      } else if (!this.currentFile) {
        session.setValue('')
      }
    },
    fileStatus () {
      if (this.fileType !== 'text') {
        return
      }
      if (!this.fileStatus) {
        editor.renderer.scrollToX(0)
        editor.renderer.scrollToY(0)
        return
      }
      // when file changed, modify the position
      editor.renderer.scrollToX(this.fileStatus.scroll.left)
      editor.renderer.scrollToY(this.fileStatus.scroll.top)
      // set undo and redo, we use concat to create new array
      session.$undoManager.$redoStack = JSON.parse(JSON.stringify(this.fileStatus.stack.redo))
      session.$undoManager.$undoStack = JSON.parse(JSON.stringify(this.fileStatus.stack.undo))
    }
  },
  mounted () {
    editor = ace.edit('editor')
    editor.$blockScrolling = Infinity
    session = editor.getSession()
    // set listener
    listenEventFromEditor.call(this, editor, session)
    // set editor
    setEditor()
    // subscribe vuex event, so that resize the editor window
    store.subscribe((mutation, state) => {
      if (['SEARCHBOX_SHOW', 'SEARCHBOX_CLOSE'].includes(mutation.type)) {
        this.$nextTick(() => {
          editor.resize()
        })
      }
    })
    // 检查更新内容的框是否显示
    this.updateConfirmShowing = false
    // 当窗口聚焦时，检查文件是否需要update
    window.addEventListener('focus', () => {
      this.checkContentUpdate()
    }, false)
  },
  components: {
    Prompt,
    Search,
    MediaDetail,
    SearchResult,
    FunctionDesc
  },
  methods: {
    contextmenu (e) {
      showContextMenu(e)
      e.preventDefault()
      e.stopPropagation()
    },
    /**
    * 检查文件是否需要更新
    */
    checkContentUpdate () {
      // 不符合的，不进行更新
      if (this.fileType !== 'text' || !this.fileStatus || this.fileStatus.status === 'N') {
        return
      }
      // 如果已经有弹框了
      if (this.updateConfirmShowing) {
        return
      }
      // 获取文件的最后修改时间，查看是否需要重新reload
      getLastModify(this.currentFile).then((lastModify) => {
        let item = store.state.resourceRecent.currentFiles[this.currentFile]
        if (item && item.lastModify < lastModify) {
          this.updateConfirmShowing = true
          confirm(lanObject.editor.modifyReloadTips, path.basename(this.currentFile)).then(() => {
            // 如果单击确定更新，则读取内容进行覆盖
            getFileContent(this.currentFile).then((content) => {
              content = content.toString()
              // 设置内容
              session.setValue(content)
              // 更新缓存
              store.dispatch('resourceRecent/setLastModify', {currentFile: this.currentFile, con: content, lastModify, force: true, status: ''})
            }).catch((e) => {
              console.log(e)
            })
            this.updateConfirmShowing = false
          }).catch(() => {
            store.dispatch('resourceRecent/setLastModify', {currentFile: this.currentFile, lastModify, force: true})
            this.updateConfirmShowing = false
          })
        }
      })
    }
  }
}

</script>