import * as types from '../mutationTypes'

/*
* initial state
*/
const state = {
  showSearchBox: false,
  params: {
    path: '',
    type: ''
  }
}

// actions
const actions = {
  ['showSearchBox'] ({ commit, state }, params) {
    commit(types.SEARCHBOX_SHOW, params)
  },
  ['closeSearchBox'] ({ commit, state }) {
    commit(types.SEARCHBOX_CLOSE)
  }
}

// mutations
const mutations = {
  [types.SEARCHBOX_SHOW] (state, params) {
    state.showSearchBox = true
    state.params = params
  },
  [types.SEARCHBOX_CLOSE] (state) {
    state.showSearchBox = false
  }
}

export default {
  state,
  actions,
  mutations
}