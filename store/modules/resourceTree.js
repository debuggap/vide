import * as types from '../mutationTypes'
import Vue from 'vue'
import path from 'path'
import {getFiles} from 'engine/resource'

const filterOut = ['.svn', '.git', '.DS_Store']
const maxRenderCount = process.env.NODE_ENV !== 'production' ? 100 : 100

/*
* --------------------
* inner variables
* --------------------
*/
let folderExpandStatus = []
/*
* autoFreshCheckStatus
* it's used to check if we need to check files of resource tree 
*/
let autoFreshCheckStatus = false

/*
* @params tpath 用于查找节点
* @params lists 节点列表
* @params firstFlag 第一次，需要清空childNodes
*/
function loadChildNodes (tpath, lists) {
  let node = getNodeByTpath(tpath)
  let filepath = node.path
  let childNodes = []
  
  for (let i = 0; i < lists.length; i++) {
    if (typeof lists[i] === 'string') {
      childNodes.push({
        hasChildren: false,
        path: filepath + path.sep + lists[i],
        text: lists[i]
      })
    } else {
      let dir = Object.keys(lists[i])[0]
      let _path = filepath + path.sep + dir
      let nodeLists = []
      if (folderExpandStatus.includes(_path)) {
        nodeLists = getChildNodesByPath(_path)
      }
      childNodes.push({
        hasChildren: true,
        isexpand: folderExpandStatus.includes(_path),
        childNodes: nodeLists,
        path: _path,
        text: dir
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
  let node = state.node
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
  let node = state.node
  if (node.path === filepath) {
    return '0'
  }
  let result = ['0']
  while (node.hasChildren && node.childNodes.length) {
    if (node.path == filepath) {
      break;
    }
    for (let i = 0; i < node.childNodes.length; i++) {
      let tempPath = node.childNodes[i].path
      if (filepath.slice(0, tempPath.length) === tempPath) {
        result.push(i)
        node = node.childNodes[i]
        break;
      }
    }
  }
  return result.join('.')
}

/*
* @params path
*/
function getChildNodesByPath (filepath) {
  let tpath = getTpathByPath(filepath)
  let node = getNodeByTpath(tpath)
  return node.childNodes
}

/*
* regularly check file update of resource tree
*/
function runAutoFilesCheck (dispatch) {
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
  let node
  for (let i = 0; i < usefulStatus.length; i++) {
    dispatch('resourceTree/loadChildNodes', {tpath: getTpathByPath(usefulStatus[i]), path: usefulStatus[i]})
  }
}

/*
* filter list by `filterOut` variable
*/
function filterList (lists) {
  return lists.filter(function (a) {
    if (!filterOut.includes(a)) {
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

/*
* --------------------
* initial state
* --------------------
*/
const state = {
  node: {
    childNodes: [],
    isexpand: true,
    hasChildren: true,
    text: '',
    path: ''
  }
}

// actions
const actions = {
  ['resourceTree/loadTree'] ({ commit, dispatch, state, rootState }) {
    if (!rootState.projectPath) {
      return
    }
    if (!autoFreshCheckStatus) {
      autoFreshCheckStatus = true
      setInterval(runAutoFilesCheck.bind(this, dispatch), 1000)
    }
    // clear folder status
    folderExpandStatus = [rootState.projectPath]
    
    getFiles(rootState.projectPath, function (lists) {
      lists = filterList(lists)
      commit(types.LOAD_RESOURCE_TREE, {lists, rootState})
    })
  },
  ['resourceTree/loadChildNodes'] ({ commit, state }, {path, tpath}) {
    getFiles(path, function (lists) {
      lists = filterList(lists)
      let node = getNodeByTpath(tpath)
      if (checkFilesContent(node.childNodes, lists)) {
        return
      }
      // let firstFlag = true
      // let instance = setInterval(function () {
      //   let subLists = lists.splice(0, maxRenderCount)
      commit(types.LOAD_CHILDNODES, {lists: lists, tpath})
      //   firstFlag = false
      //   if (!lists.length) {
      //     clearInterval(instance)
      //   }
      // }, 50)
    })
  },
  ['resourceTree/toggleStatus'] ({commit},{tpath, filepath}) {
    // get the relative node
    let node = getNodeByTpath(tpath)
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
    // commit toggle status
    commit(types.TOGGLE_STATUS_RESOURCE_TREE, node)
  }
}

// mutations
const mutations = {
  [types.LOAD_RESOURCE_TREE] (state, {lists, rootState}) {
    state.node = {
      childNodes: [],
      isexpand: true,
      hasChildren: true,
      text: rootState.projectName,
      path: rootState.projectPath
    }
    loadChildNodes('0', lists)
  },
  [types.LOAD_CHILDNODES] (state, {lists, tpath}) {
    loadChildNodes(tpath, lists)
  },
  [types.TOGGLE_STATUS_RESOURCE_TREE] (state, node) {
    node.isexpand = !node.isexpand
  }
}

export default {
  state,
  actions,
  mutations
}