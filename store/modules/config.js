import * as types from '../mutationTypes'
import deepmerge from 'deepmerge'
import systemHotkeys from 'config/hotkeys.json'

/*
* initial state
*/
let defaultState = {
  editor: {
    tabsize: 2,
    fontsize: window.devicePixelRatio === 2 ? 12 : 14
  },
  hotkeys: systemHotkeys
}
let _state = {}
try {
  _state = JSON.parse(localStorage.config)
} catch (e) {
  _state = {
    hotkeys: []
  }
}
if (systemHotkeys.length !== _state.hotkeys.length) {
  _state.hotkeys = systemHotkeys
} else {
  defaultState.hotkeys = _state.hotkeys
}
const state = deepmerge(defaultState, _state)

function storeLocalStorage () {
  let _state = JSON.parse(JSON.stringify(state))
  _state.hotkeys = _state.hotkeys.filter((item) => {
    return item.system
  })
  localStorage.config = JSON.stringify(_state)
}
// actions
const actions = {
  ['config/set'] ({ commit, state }, item) {
    commit(types.CONFIG_SET, item)
    storeLocalStorage()
  }
}

// mutations
const mutations = {
  [types.CONFIG_SET] (state, item) {
    let keys = Object.keys(item)
    while (keys.length) {
      let key = keys.shift()
      let obj = state
      let arr = key.split('.')
      while (arr.length > 1 && obj) {
        obj = obj[arr.shift()]
      }
      if (obj) {
        obj[arr[0]] = item[key]
      }
    }
  }
}

export default {
  state,
  actions,
  mutations
}