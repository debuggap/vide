<template>
  <div class="resource-tree">
    <ul @click="clickItem" @dblclick="dblclickItem" @contextmenu="contextmenu">
      <resource-tree-folder tpath="0" :node="node" key="0"></resource-tree-folder>
    </ul>
  </div>
</template>

<script>
import 'assets/css/resource/resource-tree.scss'
import ResourceTreeFolder from './ResourceTreeFolder'
import ResourceTreeLeaf from './ResourceTreeLeaf'
import DropdownMenu from '../menu/DropdownMenu.js'
import {showMenu} from 'engine/menu'
import lanObject from 'engine/language'
import {getFiles} from 'engine/resource'
import {runPackageEvent} from 'engine/package'
import {runInternalEvent} from 'engine/event'
import signal from 'engine/signal'
import path from 'path'
import store from 'store'
import {mapState} from 'vuex'
import {addRecentFiles} from 'engine/recent_files'

/*
* ------------------------------
* module variables
* ------------------------------
*/
const filterOut = ['.svn', '.git', '.DS_Store']

/*
* @params tpath 用于查找节点
* @params lists 节点列表
* @params firstFlag 第一次，需要清空childNodes
*/
function setChildNodes (tpath, lists) {
  let node = getNodeByTpath.call(this, tpath)
  let filepath = node.path
  let childNodes = []
  for (let i = 0; i < lists.length; i++) {
    if (typeof lists[i] === 'string') {
      childNodes.push({
        hasChildren: false,
        path: filepath + path.sep + lists[i],
        text: lists[i],
        parent: node
      })
    } else {
      let dir = Object.keys(lists[i])[0]
      let _path = filepath + path.sep + dir
      let nodeLists = []
      if (this.folderExpandStatus.includes(_path)) {
        nodeLists = getChildNodesByPath.call(this, _path)
      }
      childNodes.push({
        hasChildren: true,
        isexpand: this.folderExpandStatus.includes(_path),
        childNodes: nodeLists,
        path: _path,
        text: dir,
        parent: node
      })
    }
  }
  node.childNodes = childNodes
}

/*
* @params tpath: path for tree node
*/
function getNodeByTpath (tpath) {
  tpath = tpath.split('.')
  let node = this.node
  tpath.shift()
  while (tpath.length) {
    node = node.childNodes[tpath.shift()]
  }
  return node
}

/*
* @params path: path for tree node
*/
function getTpathByPath (filepath) {
  let node = this.node
  if (node.path === filepath) {
    return '0'
  }
  let result = ['0']
  while (node.hasChildren && node.childNodes.length) {
    if (node.path === filepath) {
      break
    }
    let i = 0
    let len = 0
    for (i = 0, len = node.childNodes.length; i < len; i++) {
      let tempPath = node.childNodes[i].path
      if (filepath === tempPath || filepath.slice(0, tempPath.length) === tempPath && /(\/|\\)/.test(filepath[tempPath.length])) {
        result.push(i)
        node = node.childNodes[i]
        break
      }
    }
    if (i >= len) {
      result = null
      break
    }
  }
  if (!(node && node.path === filepath)) {
    result = null
  }
  if (result) {
    return result.join('.')
  } else {
    return null
  }
}

/*
* @params path
*/
function getChildNodesByPath (filepath) {
  let tpath = getTpathByPath.call(this, filepath)
  let node = getNodeByTpath.call(this, tpath)
  return node.childNodes
}

/*
* regularly check file update of resource tree
*/
function runAutoFilesCheck () {
  let folderExpandStatus = this.folderExpandStatus
  if (!folderExpandStatus.length) {
    return
  }
  let usefulStatus = [folderExpandStatus[0]]
  let value
  let index
  for (let i = 1; i < folderExpandStatus.length; i++) {
    value = folderExpandStatus[i]
    index = value.lastIndexOf(path.sep)
    value = value.slice(0, index)
    if (usefulStatus.includes(value)) {
      usefulStatus.push(folderExpandStatus[i])
    }
  }
  for (let i = 0; i < usefulStatus.length; i++) {
    let tpath = getTpathByPath.call(this, usefulStatus[i])
    if (!tpath) {
      let index = this.folderExpandStatus.indexOf(usefulStatus[i])
      this.folderExpandStatus.splice(index, 1)
      continue
    }
    if (tpath && !/node_modules/.test(usefulStatus[i].replace(store.state.projectPath))) {
      loadChildNodes.call(this, {tpath: tpath, filepath: usefulStatus[i]})
    }
  }
}

/*
* filter list by `filterOut` variable
*/
function filterList (lists) {
  return lists.filter(function (a) {
    let value = a
    if (typeof a === 'object') {
      value = Object.keys(a)[0]
    }
    if (!filterOut.includes(value)) {
      return a
    }
  })
}

/*
* check if files are the same under the specific path
*/
function checkFilesContent (childNodes, lists) {
  if (childNodes.length !== lists.length) {
    return false
  }
  let leftStr = childNodes.map(function (a) {
    return a.text
  })
  let rightStr = lists.map(function (a) {
    if (typeof a === 'string') {
      return a
    } else {
      return Object.keys(a)[0]
    }
  })
  return leftStr.join('') === rightStr.join('')
}

function toggleStatus ({tpath, filepath}) {
  let folderExpandStatus = this.folderExpandStatus
  // get the relative node
  let node = getNodeByTpath.call(this, tpath)
  // set folderExpandStatus
  if (node.isexpand) {
    let index = folderExpandStatus.indexOf(filepath)
    folderExpandStatus.splice(index, 1)
  } else {
    folderExpandStatus.push(filepath)
  }
  folderExpandStatus.sort(function (a, b) {
    return a.split(path.sep).length > b.split(path.sep).length
  })
  // toggle expand status
  node.isexpand = !node.isexpand
}

function loadChildNodes ({tpath, filepath}) {
  getFiles(filepath, (lists) => {
    lists = filterList(lists)
    let node = getNodeByTpath.call(this, tpath)
    if (checkFilesContent(node.childNodes, lists)) {
      return
    }
    setChildNodes.call(this, tpath, lists)
  })
}

// load tree
function loadTree () {
  let projectPath = this.projectPath
  if (!projectPath) {
    return
  }
  // clear folder status
  this.folderExpandStatus = [projectPath]
  getFiles(projectPath, (lists) => {
    lists = filterList(lists)
    setChildNodes.call(this, '0', lists)
  })
}

/*
* ------------------------------
* event for resource tree
* ------------------------------
*/
// 在文件目录上的contextmenu事件
function folderContextEvent ({item}, event) {
  let lists = [
    {name: lanObject.resourceTree.newFile, func: 'resourceTreeMenuEvent.newFile'},
    {name: lanObject.resourceTree.newFolder, func: 'resourceTreeMenuEvent.newFolder'},
    '|',
    {name: lanObject.resourceTree.rename, func: 'resourceTreeMenuEvent.renameFolder'},
    {name: lanObject.resourceTree.pasteFile, func: 'resourceTreeMenuEvent.pasteFile'},
    {name: lanObject.resourceTree.deleteFolder, func: 'resourceTreeMenuEvent.deleteFolder'},
    '|',
    {name: lanObject.navHead.findInFiles, func: 'resourceTreeMenuEvent.searchInDirectory'},
    {name: lanObject.resourceTree.showInFolder, func: 'resourceTreeMenuEvent.revealPath'},
    {name: lanObject.resourceTree.refreshFolders, func: 'resourceTreeMenuEvent.refreshFolder'}
  ]
  if (!this.active) {
    lists = lists.concat([
      '|',
      {name: lanObject.allResourceTree.active, func: 'resourceTreeMenuEvent.activeProject'},
      {name: lanObject.allResourceTree.delete, func: 'resourceTreeMenuEvent.deleteProject'},
      {name: lanObject.allResourceTree.newWindow, func: 'resourceTreeMenuEvent.openProjectInNewWindow'}
    ])
  }
  try {
    lists = lists.concat(store.state.extmenu.resourceLeaf)
  } catch (e) {}
  showMenu(lists, {x: event.x, y: event.y, container: document.querySelector('.content-wrap')}, ({func}) => {
    if (func.indexOf('.') !== -1) {
      runInternalEvent(func, [item])
    } else if (func.indexOf(':') !== -1) {
      runPackageEvent(func, [item])
    }
  })
}

// 在文件上的contextmenu事件
function leafContextEvent ({item}, event) {
  let lists = [
    {name: lanObject.resourceTree.rename, func: 'resourceTreeMenuEvent.renameFile'},
    '|',
    {name: lanObject.resourceTree.copyFile, func: 'resourceTreeMenuEvent.copyFile'},
    {name: lanObject.resourceTree.pasteFile, func: 'resourceTreeMenuEvent.pasteFile'},
    {name: lanObject.resourceTree.deleteFile, func: 'resourceTreeMenuEvent.deleteFile'},
    {name: lanObject.resourceTree.duplicate, func: 'resourceTreeMenuEvent.duplicateFile'},
    '|',
    {name: lanObject.resourceTree.showInFolder, func: 'resourceTreeMenuEvent.revealPath'}
  ]
  try {
    lists = lists.concat(store.state.extmenu.resourceFolder)
  } catch (e) {}
  showMenu(lists, {x: event.x, y: event.y, container: document.querySelector('.content-wrap')}, ({func}) => {
    if (func.indexOf('.') !== -1) {
      runInternalEvent(func, [item])
    } else if (func.indexOf(':') !== -1) {
      runPackageEvent(func, [item])
    }
  })
}

// 目录打开，关闭事件
function clickExpandEvent ({item, elem, tpath}) {
  // 切换状态
  toggleStatus.call(this, {tpath, filepath: item.path})
  if (item.isexpand) {
    if (!item.childNodes.length) {
      loadChildNodes.call(this, {filepath: item.path, tpath})
    }
  }
}

// 单击文件，打开文件
function clickLeaf ({item}) {
  store.dispatch('editor/setFile', {currentFile: item.path})
}

// 双击文件
function dblclickLeaf ({item}) {
  store.dispatch('resourceRecent/addItem', item.path)
  addRecentFiles(item.path)
}

export default {
  name: 'resource-tree',
  props: ['projectName', 'projectPath', 'active'],
  components: {
    ResourceTreeLeaf,
    ResourceTreeFolder,
    DropdownMenu
  },
  data () {
    return {
      node: {
        childNodes: [],
        isexpand: this.active,
        hasChildren: true,
        text: this.projectName,
        path: this.projectPath
      },
      folderExpandStatus: []
    }
  },
  computed: {
    ...mapState({
      currentProjectPath: state => state.projectPath
    })
  },
  watch: {
    currentProjectPath () {
      if (this.active) {
        this.projectName = this.node.text = store.state.projectName
        this.projectPath = this.node.path = store.state.projectPath
        this.folderExpandStatus = []
        loadTree.call(this)
      }
    }
  },
  methods: {
    clickItem (event) {
      let target = event.target
      let elem = target.closest('.resource-tree-node-leaf')
      if (target.className.indexOf('resource-tree-folder-status') !== -1) {
        elem = target.closest('.resource-tree-node-folder')
        let tpath = elem.getAttribute('tpath')
        let item = getNodeByTpath.call(this, tpath)
        clickExpandEvent.call(this, {item, elem, tpath}, event)
      } else if (elem) {
        let tpath = elem.getAttribute('tpath')
        let item = getNodeByTpath.call(this, tpath)
        clickLeaf({item, elem}, event)
      }
    },
    dblclickItem (event) {
      let elem = event.target.closest('.resource-tree-node-folder,.resource-tree-node-leaf')
      let tpath = elem.getAttribute('tpath')
      let item = getNodeByTpath.call(this, tpath)
      let onFolder = elem.className.indexOf('resource-tree-node-folder') !== -1
      if (onFolder) {
        clickExpandEvent.call(this, {item, elem, tpath}, event)
      } else {
        dblclickLeaf({item, elem}, event)
      }
    },
    contextmenu (event) {
      let elem = event.target.closest('.resource-tree-node-folder,.resource-tree-node-leaf')
      let tpath = elem.getAttribute('tpath')
      let item = getNodeByTpath.call(this, tpath)
      let onFolder = elem.className.indexOf('resource-tree-node-folder') !== -1
      if (onFolder) {
        folderContextEvent.call(this, {item, elem}, event)
      } else {
        leafContextEvent.call(this, {item, elem}, event)
      }
      event.preventDefault()
    }
  },
  mounted () {
    // register signal,when we refresh the folder manually
    signal.receive('reloadTreeByPath', (filepath) => {
      let tpath = getTpathByPath.call(this, filepath)
      if (tpath) {
        loadChildNodes.call(this, {tpath: tpath, filepath: filepath})
      }
    })
    // only this resource-tree is active
    if (this.active) {
      // load tree
      loadTree.call(this)
      // window.runAutoFilesCheck = runAutoFilesCheck.bind(this)
      setInterval(runAutoFilesCheck.bind(this), 2000)
    }
  }
}
</script>
