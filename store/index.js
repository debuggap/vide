import Vue from 'vue'
import Vuex from 'vuex'
import * as actions from './actions'
import mutations from './mutations'
import createLogger from 'vuex/dist/logger'
import resourceRecent from './modules/resourceRecent'
import toolbar from './modules/toolbar'
import extmenu from './modules/extmenu'
import editor from './modules/editor'
import search from './modules/search'
import config from './modules/config'

Vue.use(Vuex)

// const debug = process.env.NODE_ENV === 'development'
const debug = false
const store = new Vuex.Store({
  state: {
    projectName: '',
    projectPath: '',
    dynamicComponent: null,
    dynamicComponentData: null
  },
  modules: {
    resourceRecent,
    toolbar,
    extmenu,
    editor,
    search,
    config
  },
  actions,
  mutations,
  strict: debug,
  plugins: debug ? [createLogger()] : []
})
export default store
