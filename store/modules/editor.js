import * as types from '../mutationTypes'
import Vue from 'vue'
import {getFileContent, getLastModify} from 'engine/helper/file_helper'
import {getFileMode, getFileModeByContent, getMediaMode} from 'engine/file_mode'
import {checkAceModule} from 'engine/editor'

/*
* initial state
* @params fileType
* @value system: system application
* @value text: text file
* @value media: media file
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
  async ['editor/setFile'] ({ commit, state, rootState, dispatch }, {currentFile, content, callback}) {
    // if it is search result
    if (currentFile === 'Search Results') {
      commit(types.EDITOR_SET_SEARCH_TYPE, {currentFile})
      callback && callback()
      return
    }
    // 检查缓存内容是否可以使用，只针对可编辑内容
    let currentFiles = rootState.resourceRecent.currentFiles
    if (!content && currentFiles[currentFile] && currentFiles[currentFile].con !== undefined) {
      let item = currentFiles[currentFile]
      // 如果是不在修改状态的文件（status不为N和M），查看是否可以直接更新内容
      if (item.status === '') {
        let lastModify = await getLastModify(currentFile)
        // 如果时间不一样，这直接更新
        if (lastModify > item.lastModify) {
          content = await getFileContent(currentFile)
          content = content.toString()
          dispatch('resourceRecent/setLastModify', {currentFile, con: content, lastModify, force: true})
        } else {
          content = item.con
        }
      } else {
        // status为N,M直接返回内容，不需要查看是否有更新后，再返回内容，真正检查更新机制在editorWrap
        content = item.con
      }
    }
    // 设置编辑器的当前文件
    if (content === undefined) {
      try {
        content = await getFileContent(currentFile)
      } catch (e) {
        // if this file doesn't exist, assign empty value
        content = ''
      }
      content = content.toString()
    }
    let fileMode = getFileMode(currentFile, content)
    if (fileMode || !/\uFFFD/.test(content)) {
      // 获取文件模式
      if (!fileMode) {
        fileMode = currentFile.slice(currentFile.lastIndexOf('.') + 1)
      }
      let modeExist = await checkAceModule('mode-' + fileMode + '.js')
      if (!modeExist) {
        fileMode = undefined
      }
      if (fileMode === 'text' || fileMode === undefined) {
        fileMode = getFileModeByContent(content)
    	}
    	if (!fileMode) {
        fileMode = 'text'
      }
      // 如果没有设置过，则设置当前文件的最后修改时间，同时也设置内容
      dispatch('resourceRecent/setLastModify', {currentFile, con: content})
      // 设置文件
      commit(types.EDITOR_SET_FILE_TYPE, {currentFile, content, fileMode})
  	} else {
      let info = getMediaMode(currentFile)
      if (info) {
        commit(types.EDITOR_SET_MEDIA_TYPE, {currentFile})
      } else {
        commit(types.EDITOR_SET_SYSTEM_TYPE, {currentFile})
      }
  	}
  	callback && callback()
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
  [types.EDITOR_SET_MEDIA_TYPE] (state, {currentFile}) {
    state.currentFile = currentFile
    state.fileType = 'media'
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
  [types.FILE_CREATE] (state, {filepath, con, fileMode}) {
    state.currentFile = filepath
    state.content = con
    state.fileType = 'text'
    state.fileMode = fileMode
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