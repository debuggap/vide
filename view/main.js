import './assets/css/main.scss'
import './assets/css/element-#3870bf/index.css'

import Vue from 'vue'
import App from './App'
import store from '../store'
// start script when app launches
import 'engine/start'

/* eslint-disable no-new */
new Vue({
  el: '#app',
  store,
  template: '<App/>',
  components: { App }
})
