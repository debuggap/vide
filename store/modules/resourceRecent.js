import * as types from '../mutationTypes'
import {getLastModify} from 'engine/helper/file_helper'
import {getFileModeByContent} from 'engine/file_mode'
import Vue from 'vue'

// store recent lists in the localStorage
function storeList () {
  localStorage['openfile_' + location.hash.slice(1)] = JSON.stringify(state.lists)
}

//get untitled name
function getUntitledName () {
  let name = 'untitled'
  let i = 0
  if (state.lists.includes(name)) {
    for (i = 1; i < 31; i++) {
      name = 'untitled(' + i + ')'
      if (!state.lists.includes(name)) {
        break
      }
    }
  }
  if (i >= 30) {
    alert( "Limit of untitled file is 30" )
    return null
  } else {
    return name
  }
}

// initial state
const state = {
  lists: [],
  currentFiles: {}
}

// actions
const actions = {
  ['resourceRecent/modifyOrder'] ({ commit, state }, value) {
    commit(types.RECENT_MODIFY_ORDER, value)
  },
  ['resourceRecent/addItem'] ({commit, state}, item) {
    commit(types.RECENT_ADD_ITEM, {filepath: item, status: ''})
    storeList()
  },
  ['resourceRecent/deleteItem'] ({commit, dispatch, state}, item) {
    let index = state.lists.indexOf(item)
    if (index !== -1) {
      index = index - 1
      if (index < 0) {
        index = 0
      }
    }
    commit(types.RECENT_DELETE_ITEM, item)
    storeList()
    // set path
    if (state.lists[index]) {
      dispatch('editor/setFile',{currentFile: state.lists[index]})
    } else {
      dispatch('editor/clean')
    }
  },
  ['editingFile'] ({commit, state}, {filepath, con, undoManager}) {
    commit(types.RECENT_RECORD_MODIFICATION, {filepath, status: 'M', con})
    if (undoManager) {
      setTimeout(() => {
        commit(types.RECENT_RECORD_MODIFICATION, {filepath, stack: {undo: undoManager.$undoStack.concat([]), redo: undoManager.$redoStack.concat([])}})
      }, 50)
    }
  },
  async ['saveFile'] ({commit, state}, filepath) {
    let lastModify = await getLastModify(filepath)
    commit(types.RECENT_RECORD_MODIFICATION, {filepath, status: '', lastModify})
  },
  ['saveNewFile'] ({commit, state}, {oldPath, realPath}) {
    commit(types.RECENT_REPLACE_PATH, {oldPath, realPath})
    commit(types.RECENT_RECORD_MODIFICATION, {filepath: realPath, status: ''})
  },
  ['createNewFile'] ({commit, state, rootState}, obj) {
    if (!obj) {
      obj = {}
    }
    let name = getUntitledName()
    if (name) {
      commit(types.RECENT_ADD_ITEM, {filepath: name, con: obj.con ? obj.con : '', status: 'N'})
      let fileMode = 'text'
      if (obj.con) {
        fileMode = getFileModeByContent(obj.con)
        fileMode = fileMode || 'text'
      }
      commit(types.FILE_CREATE, {filepath: name, con: obj.con ? obj.con : '', fileMode})
    }
  },
  ['scrollFile'] ({commit, state}, {filepath, scroll}) {
    commit(types.RECENT_RECORD_MODIFICATION, {filepath, scroll})
  },
  ['anchorPosition'] ({commit, state, rootState}, anchor) {
    if (state.lists.includes(rootState.editor.currentFile)) {
      commit(types.RECENT_RECORD_MODIFICATION, {filepath: rootState.editor.currentFile, anchor})
    }
  },
  /*
  * 设置文件的lastModify
  * @param {Boolean} force: 是否强制设置时间
  */
  async ['resourceRecent/setLastModify'] ({commit, state}, {currentFile, con, force, lastModify, status}) {
    let item = state.currentFiles[currentFile]
    if (item && (force || !item.lastModify)) {
      if (!lastModify) {
        lastModify = await getLastModify(currentFile)
      }
      commit(types.RECENT_RECORD_MODIFICATION, {filepath: currentFile, lastModify, con, status})
    }
  }
}

// mutations
const mutations = {
  [types.HASH_CHANGE] (state, {projectName}) {
    let lists = []
    try {
      lists = JSON.parse(localStorage['openfile_' + projectName])
      lists = lists.filter((item) => {
        return item
      })
    } catch (e) {}
    state.lists = lists
    // 存储当前文件的一些信息
    let currentFiles = {}
    for (let i = 0; i < lists.length; i++) {
      currentFiles[lists[i]] = {
        status: '',
        lastModify: null,
        con: undefined,
        scroll: {left: 0, top: 0},
        anchor: {row: 0, colomn: 0},
        stack: {undo: [], redo: []}
      }
    }
    state.currentFiles = currentFiles
  },
  [types.RECENT_MODIFY_ORDER] (state, { domIndex, dragIndex }) {
    let domIndexValue = state.lists[domIndex]
    let dragIndexValue = state.lists[dragIndex]
    let start, end
    start = domIndex
    end = dragIndex
    if (domIndex < dragIndex) {
      while (start < end) {
        state.lists[start] = state.lists[start + 1]
        start += 1
      }
    } else if (domIndex > dragIndex) {
      while (start > end) {
        state.lists[start] = state.lists[start - 1]
        start -= 1
      }
    } else {
      return
    }
    state.lists[end] = domIndexValue
    // Vue.set(state.lists, end, domIndexValue)
  },
  [types.RECENT_ADD_ITEM] (state, {filepath, status, con}) {
    if (typeof filepath === 'string' && !state.lists.includes(filepath)) {
      state.lists.push(filepath)
      Vue.set(state.currentFiles, filepath, {
        status: status,
        con: con,
        lastModify: null,
        anchor: {row: 0, colomn: 0},
        scroll: {left: 0, top: 0},
        stack: {undo: [], redo: []}
      })
    }
  },
  [types.RECENT_DELETE_ITEM] (state, item) {
    let index = state.lists.indexOf(item)
    if (index !== -1) {
      state.lists.splice(index, 1)
      Vue.delete(state.currentFiles, item)
      delete state.currentFiles[item]
    }
  },
  [types.RECENT_RECORD_MODIFICATION] (state, {filepath, status, con, scroll, stack, anchor, lastModify}) {
    if (!state.currentFiles[filepath]) {
      return
    }
    if (lastModify !== undefined) {
      state.currentFiles[filepath]['lastModify'] = lastModify
    }
    if (status !== undefined) {
      if (status && !state.currentFiles[filepath]['status']) {
        state.currentFiles[filepath]['status'] = status
      } else if (!status) {
        state.currentFiles[filepath]['status'] = ''
      }
    }
    if (con !== undefined) {
      state.currentFiles[filepath]['con'] = con
    }
    if (scroll !== undefined) {
      if (typeof scroll.left !== undefined) {
        state.currentFiles[filepath].scroll.left = scroll.left > 0 ? scroll.left : 0
      }
      if (typeof scroll.top !== undefined) {
        state.currentFiles[filepath].scroll.top = scroll.top > 0 ? scroll.top : 0
      }
    }
    if (stack !== undefined) {
      state.currentFiles[filepath].stack = stack
    }
    if (anchor !== undefined) {
      state.currentFiles[filepath].anchor = anchor
    }
  },
  [types.RECENT_REPLACE_PATH] (state, {oldPath, realPath}) {
    let index = state.lists.indexOf(oldPath)
    if (index != -1) {
      state.lists.splice(index, 1, realPath)
      state.currentFiles[realPath] = state.currentFiles[oldPath]
      delete state.currentFiles[oldPath]
    }
  }
}

export default {
  state,
  actions,
  mutations
}