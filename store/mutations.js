import * as types from './mutationTypes'

const mutations = {
  [types.HASH_CHANGE] (state, { projectName, projectPath }) {
    state.projectName = projectName
    state.projectPath = projectPath
  },
  [types.CHANGE_DYNAMIC_COMPONENT] (state, { component, data }) {
    state.dynamicComponent = component
    state.dynamicComponentData = data
  },
  [types.CLOSE_DYNAMIC_COMPONENT] (state) {
    state.dynamicComponent = null
    state.dynamicComponentData = null
  }
}
export default mutations
