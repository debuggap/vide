<template>
  <div class="nav-head">
    	<ul class="nav">
    	  <li v-for="item in navList" class="dropdown" :class="{ open: dropdownMenuIndex == item.index }">
    	    <a class="dropdown-toggle" @click="showMenu($event, item.index)" href="javascript:void(0)">{{item.name}}</a>
    	    <dropdown-menu v-if="dropdownMenuIndex == item.index" :lists="dropdownMenuList" @menuItemClick="menuItemClick" @menuClose="menuClose" ></dropdown-menu>
    	  </li>
    	</ul>
	</div>
</template>

<script>
import 'assets/css/nav/nav-head.scss'
import lanObject from 'engine/language'
import DropdownMenu from '../menu/DropdownMenu.js'
import {runInternalEvent} from 'engine/event'
import {runPackageEvent} from 'engine/package'
import store from 'store'
import {mapState} from 'vuex'

const navList = [
  { name: lanObject.navHead.file, index: 'File' },
  { name: lanObject.navHead.edit, index: 'Edit' },
  { name: lanObject.navHead.find, index: 'Find' },
  { name: lanObject.navHead.preferences, index: 'Preferences' }
]

const menu = {
  'File': [
    { name: lanObject.navHead.newFile, func: 'navEvent.newFile' }, '|',
    { name: lanObject.navHead.openFile, func: 'navEvent.openFile' },
    { name: lanObject.navHead.openProject, func: 'navEvent.openProject' },
    { name: lanObject.navHead.reopenFiles, loadSub: 'loadOpenRecentFiles', sub: [] },
    { name: lanObject.navHead.reopenProjects, loadSub: 'loadOpenRecentProjects', sub: [] },
    { name: lanObject.navHead.save, func: 'navEvent.saveFile' }, { name: lanObject.navHead.saveAs, func: 'navEvent.saveAsFile' }, '|',
    { name: lanObject.navHead.quit, func: 'navEvent.close' }],
  'Edit': [
    { name: lanObject.navHead.undo, func: 'undo' },
    { name: lanObject.navHead.redo, func: 'redo' }, '|',
    { name: lanObject.common.copy, func: 'navEvent.copy', bindKey: { mac: 'Command-C', win: 'Ctrl-C' } },
    { name: lanObject.common.cut, func: 'navEvent.cut', bindKey: { mac: 'Command-X', win: 'Ctrl-X' } },
    { name: lanObject.common.paste, func: 'navEvent.paste', bindKey: { mac: 'Command-V', win: 'Ctrl-V' } }
  ],
  'Find': [
    { name: lanObject.navHead.findCurrent, func: 'navEvent.findInFile' },
    { name: lanObject.navHead.findNext, func: 'findnext' },
    { name: lanObject.navHead.findPrevious, func: 'findprevious' },
    { name: lanObject.navHead.findAll, func: 'findAll' },
    { name: lanObject.navHead.replace, func: 'navEvent.replaceInFile' },
    { name: lanObject.navHead.findInFiles, func: 'navEvent.findInProject' }, '|',
    { name: lanObject.navHead.findFiles, func: 'navEvent.findFiles' }
  ],
  'Preferences': [
      { name: lanObject.navHead.uiTheme, func: 'navEvent.loadThemePage' },
      { name: lanObject.navHead.editorConfig, func: 'navEvent.loadEditorSetting' },
      { name: lanObject.navHead.pluginManage, func: 'navEvent.loadPluginManage' }
  ]
}

export default {
  name: 'nav-head',
  data () {
    return {
      dropdownMenuIndex: null,
      dropdownMenuList: null
    }
  },
  computed: {
    ...mapState({
      navList (state) {
        let navHead = store.state.extmenu.navHead
        for (let i = 0; i < navHead.length; i++) {
          if (!navHead[i].index) {
            navHead[i].index = navHead[i].name + new Date().getTime()
          }
          navList.push({
            name: navHead[i].name,
            index: navHead[i].index
          })
        }
        return navList
      },
      menu (state) {
        let navHead = store.state.extmenu.navHead
        for (let i = 0; i < navHead.length; i++) {
          if (navHead[i].menu) {
            menu[navHead[i].index] = navHead[i].menu
          }
        }
        return menu
      }
    })
  },
  methods: {
    showMenu (event, index) {
      // 赋值menu栏,根据当前的值，自动显示相应的menu列表
      this.dropdownMenuIndex = index
      this.dropdownMenuList = this.menu[index]
      // check if it exists automatic submenu
      this.checkAutoSubmenu(this.menu[index])
    },
    checkAutoSubmenu (list) {
      let item
      for (let i = 0, len = list.length; i < len; i++) {
        item = list[i]
        if (item !== '|' && item.loadSub && this[item.loadSub]) {
          this[item.loadSub](item)
        }
      }
    },
    loadOpenRecentFiles (item) {
      let recentFiles = []
      try {
        recentFiles = JSON.parse(localStorage.recentFiles)
      } catch (e) {}
      if (recentFiles.length) {
        recentFiles = recentFiles.map((item) => {
          return {name: item, func: 'navEvent.setFile'}
        })
        recentFiles.push('|')
        recentFiles.push({name: 'Clear items', func: 'navEvent.clearRecent'})
      }
      item.sub = recentFiles
    },
    loadOpenRecentProjects (item) {
      let recentProjects = []
      try {
        recentProjects = JSON.parse(localStorage.recentProjects)
      } catch (e) {}
      if (recentProjects.length) {
        recentProjects = recentProjects.map((item) => {
          return {name: item, text: item, func: 'navEvent.loadProject'}
        })
      }
      item.sub = recentProjects
    },
    // menu callback
    menuItemClick (item) {
      let func = item.func
      try {
        if (func.indexOf('.') !== -1) {
          runInternalEvent(func, [item])
        } else if (func.indexOf(':') !== -1) {
          runPackageEvent(func, [item])
        }
      } catch (e) {
        console.error(e)
      }
    },
    menuClose () {
      this.dropdownMenuIndex = null
      this.dropdownMenuList = null
    }
  },
  components: {
    DropdownMenu
  }
}

</script>