import './assets/css/main.scss'

import Vue from 'vue'
import App from './App'
import store from '../store'
// start script when app launches
import 'engine/start'

/* eslint-disable no-new */
export default new Vue({
  el: '#app',
  store,
  template: '<App/>',
  components: { App }
})
