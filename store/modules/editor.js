import * as types from '../mutationTypes'
import Vue from 'vue'
import co from 'co'
import {getFileContent} from 'engine/helper/file_helper'
import {getFileMode, getFileModeByContent, getMediaMode} from 'engine/file_mode'
import {checkAceModule} from 'engine/editor'

/*
* initial state
* @params fileType
* @value system: system application
* @value text: text file
* @value image: image file
* @value search: search result file
*/
const state = {
  currentFile: '', // 当前打开文件的路径
  content: '', // 编辑器的内容
  anchor: {row: 0, column: 0}, // 当前光标位置
  fileMode: '',
  fileType: 'text', // 文件类型
  promptLists: [], // 提示框列表内容
  promptStr: '',
  promptName: ''
}

// actions
const actions = {
  ['editor/setFile'] ({ commit, state, rootState }, {currentFile, content, callback}) {
    // if it is search result
    if (currentFile === 'Search Results') {
      commit(types.EDITOR_SET_SEARCH_TYPE, {currentFile})
      callback && callback()
      return
    }
    // if content exists in the cache of currentFiles
    let currentFiles = rootState.resourceRecent.currentFiles
    if (currentFiles[currentFile] && currentFiles[currentFile].con !== undefined) {
      content = currentFiles[currentFile].con
    }
    // 设置编辑器的当前文件
    co(function *(){
      if (content === undefined) {
        try {
          content = yield getFileContent(currentFile)
        } catch (e) {
          // if this file doesn't exist, assign empty value
          content = ''
        }
        content = content.toString()
      }
      let fileMode = getFileMode(currentFile, content)
      if (fileMode || !/\uFFFD/.test(content)) {
        if (!fileMode) {
          fileMode = currentFile.slice(currentFile.lastIndexOf('.') + 1)
        }
        let modeExist = yield checkAceModule('mode-' + fileMode + '.js')
        if (!modeExist) {
          fileMode = undefined
        }
        if (fileMode === 'text' || fileMode === undefined) {
          fileMode = getFileModeByContent(content)
      	}
      	if (!fileMode) {
          fileMode = 'text'
        }
        commit(types.EDITOR_SET_FILE_TYPE, {currentFile, content, fileMode})
    	} else {
        let info = getMediaMode(currentFile)
        if (info) {
          commit(types.EDITOR_SET_IMAGE_TYPE, {currentFile})
        } else {
          commit(types.EDITOR_SET_SYSTEM_TYPE, {currentFile})
        }
    	}
    	callback && callback()
    })
    
  },
  ['editor/clean'] ({ commit, state }) {
    commit(types.EDITOR_CLEAN)
  },
  ['anchorPosition'] ({ commit, state }, pos) {
    commit(types.EDITOR_SET_ANCHOR, pos)
  },
  ['editor/setPromptLists'] ({ commit, state }, obj) {
    commit(types.EDITOR_SET_PROMPT_LISTS, obj)
  },
  ['editor/cleanPromptLists'] ({ commit, state }) {
    commit(types.EDITOR_SET_PROMPT_LISTS, {promptLists: [], promptStr: ''})
  },
  ['editor/setPromptEngine'] ({ commit, state }, name) {
    commit(types.EDITOR_SET_PROMPT_ENGINE, name)
  }
}

// mutations
const mutations = {
  [types.EDITOR_SET_FILE_TYPE] (state, {currentFile, content, fileMode}) {
    state.currentFile = currentFile
    state.content = content
    state.fileMode = fileMode
    state.fileType = 'text'
  },
  [types.EDITOR_SET_IMAGE_TYPE] (state, {currentFile}) {
    state.currentFile = currentFile
    state.fileType = 'image'
  },
  [types.EDITOR_SET_SYSTEM_TYPE] (state, {currentFile}) {
    state.currentFile = currentFile
    state.fileType = 'system'
  },
  [types.EDITOR_SET_SEARCH_TYPE] (state, {currentFile}) {
    state.currentFile = currentFile
    state.fileType = 'search'
  },
  [types.EDITOR_CLEAN] (state) {
    state.currentFile = ''
    state.fileType = ''
    state.content = ''
  },
  [types.FILE_CREATE] (state, {filepath, con}) {
    state.currentFile = filepath
    state.content = con
    state.fileType = 'text'
  },
  [types.EDITOR_SET_ANCHOR] (state, pos) {
    state.anchor = pos
  },
  [types.EDITOR_SET_PROMPT_LISTS] (state, {promptLists, promptStr}) {
    state.promptLists = promptLists
    state.promptStr = promptStr
  },
  [types.EDITOR_SET_PROMPT_ENGINE] (state, name) {
    state.promptName = name
  }
}

export default {
  state,
  actions,
  mutations
}