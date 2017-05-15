import * as types from '../mutationTypes'

/*
* initial state
*/
const state = {
  resourceLeaf: [],
  resourceFolder: [],
  editorContext: [],
  navHead: []
}

// actions
const actions = {
  ['extmenu/addItem'] ({ commit, state }, item) {
    commit(types.EXTMENU_ADD_ITEM, item)
  },
  ['extmenu/deleteItem'] ({ commit, state }, item) {
    commit(types.EXTMENU_DELETE_ITEM, item)
  }
}

// mutations
const mutations = {
  [types.EXTMENU_ADD_ITEM] (state, item) {
    if (state[item.type]) {
      state[item.type].push(item)
    }
  },
  [types.EXTMENU_DELETE_ITEM] (state, item) {
    if (state[item.type]) {
      state[item.type].every((obj, index) => {
        if (item.name === obj.name) {
          state[item.type].splice(index, 1)
          return false
        }
      })
    }
  }
}

export default {
  state,
  actions,
  mutations
}