<template>
  <div class="content">
    <div id="editor" class="editor-base" @contextmenu="contextmenu" ref="editor"></div>
    <prompt></prompt>
    <image-detail v-if="fileType === 'image'"></image-detail>
    <search-result v-show="fileType === 'search'"></search-result>
    <search v-if="showSearchBox"></search>
  </div>
</template>

<script>
import ace from 'ace'
import path from 'path'
import Prompt from './Prompt'
import Search from './Search'
import ImageDetail from './ImageDetail'
import SearchResult from './SearchResult'
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
import Signal from 'engine/signal'

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
  editor.session.on('changeScrollTop', (top) => {
    store.dispatch('scrollFile', {filepath: this.currentFile, scroll: {top: top}})
    Signal.send('editor/changeScroll')
  })
  editor.session.on('changeScrollLeft', (left) => {
    store.dispatch('scrollFile', {filepath: this.currentFile, scroll: {left: left}})
    Signal.send('editor/changeScroll')
  })
  editor.on('paste', function (event) {
    let currentContent = editor.getValue()
    let basename = path.basename(store.state.editor.currentFile)
    if (!currentContent && event.text && basename && !basename.includes('.')) {
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
      if (this.fileType === 'text') {
        isChangingFile = true
        session.setValue(this.content)
        session.setMode('ace/mode/' + this.fileMode)
        editor.focus()
        isChangingFile = false
      } else if (!this.currentFile) {
        session.setValue('')
      }
    },
    showSearchBox () {
      if (this.showSearchBox) {
        this.$refs.editor.style.bottom = '160px'
      } else {
        this.$refs.editor.style.bottom = '0px'
      }
      editor.resize()
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
  },
  components: {
    Prompt,
    Search,
    ImageDetail,
    SearchResult
  },
  methods: {
    contextmenu (e) {
      showContextMenu(e)
      e.preventDefault()
      e.stopPropagation()
    }
  }
}

</script>