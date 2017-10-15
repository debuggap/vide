import * as types from './mutationTypes'
import {saveRecentProjects} from 'engine/project'

export const hashchange = ({ commit, dispatch, rootState }, { projectName, projectPath }) => {
  saveRecentProjects(projectName)
  document.title = `VIDE(${nw.App.manifest.version})/${projectName}`
  commit(types.HASH_CHANGE, { projectName, projectPath })
}

export const changeDynamicComponent = ({ commit, dispatch, rootState }, { component, data }) => {
  commit(types.CHANGE_DYNAMIC_COMPONENT, { component, data })
}

export const closeDynamicComponent = ({ commit, dispatch, rootState }) => {
  commit(types.CLOSE_DYNAMIC_COMPONENT)
}
