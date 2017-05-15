import * as types from '../mutationTypes'

/*
* initial state
* item:
* {
*   name: 'open',
*   desc: 'open file from dist',
*   icon: '',
*   unique: 'open'
* }
*/
const state = {
  lists: []
}

// actions
const actions = {
  ['toolbar/addItem'] ({ commit, state }, item) {
    commit(types.TOOLBAR_ADD_ITEM, item)
  },
  ['toolbar/deleteItem'] ({ commit, state }, key) {
    if (!key) {
      return
    }
    commit(types.TOOLBAR_DELETE_ITEM, key)
  }
}

// mutations
const mutations = {
  [types.TOOLBAR_ADD_ITEM] (state, item) {
    state.lists.push(item)
  },
  [types.TOOLBAR_DELETE_ITEM] (state, key) {
    let index = -1
    state.lists.some((item, i) => {
      if (item.key === key) {
        index = i
        return true
      }
    })
    if (index !== -1) {
      state.lists.splice(index, 1)
    }
  }
}

export default {
  state,
  actions,
  mutations
}