<template>
  <div class="search-box">
    <el-form ref="form" :model="form" label-width="0px">
      <el-form-item class="search-flag-row">
        <el-tooltip class="item" effect="light" popper-class="search-flag-tooltip" content="Whole Word" placement="top-start">
          <el-button type="primary" :class="[{ active: form.wholeFlag }, 'search-flag']" @click="form.wholeFlag = !form.wholeFlag">\b</el-button>
        </el-tooltip>
        <el-tooltip class="item" effect="light" popper-class="search-flag-tooltip" content="Match Case" placement="top-start">
          <el-button type="primary" :class="[{ active: form.ignoreFlag }, 'search-flag']" @click="form.ignoreFlag = !form.ignoreFlag">Aa</el-button>
        </el-tooltip>
        <el-tooltip class="item" effect="light" popper-class="search-flag-tooltip" content="Use Regex" placement="top-start">
          <el-button type="primary" :class="[{ active: form.regFlag }, 'search-flag']" @click="form.regFlag = !form.regFlag">.*</el-button>
        </el-tooltip>
      </el-form-item>
      <el-form-item>
        <el-input v-model="form.find" :placeholder="lanObject.findContent" class="sb-input0 sb-find"></el-input>
        <el-button type="primary" class="sb-button0" @click="find">{{lanObject.find}}</el-button>
      </el-form-item>
      <el-form-item>
        <el-input v-model="form.replace" :placeholder="lanObject.replaceContent" class="sb-input0 sb-replace"></el-input>
        <el-button type="primary" class="sb-button0" @click="replace">{{lanObject.replace}}</el-button>
      </el-form-item>
      <el-form-item>
        <el-input v-model="form.path" :placeholder="lanObject.path" class="sb-path"></el-input>
        <span style="height:36px">&nbsp;/&nbsp;</span>
        <el-input v-model="form.filetype" :placeholder="lanObject.type" class="sb-type"></el-input>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import 'assets/css/editor/search.scss'
import Vue from 'vue'
import store from 'store'
import {mapState} from 'vuex'
import {Form, FormItem, Input, Button, Tooltip} from 'element-ui'
import lanObject from 'engine/language'
import {search} from 'engine/search'
import {alert} from 'engine/message_box'
Vue.use(Form)
Vue.use(FormItem)
Vue.use(Input)
Vue.use(Button)
Vue.use(Tooltip)
export default {
  name: 'search',
  data () {
    return {
      form: {
        find: '',
        replace: '',
        filetype: '',
        regFlag: false,
        ignoreFlag: false,
        wholeFlag: false,
        path: store.state.search.params.path,
        exclude: 'node_modules'
      },
      lanObject: lanObject.search
    }
  },
  computed: {
    ...mapState({
      path (state) {
        return state.search.params.path
      }
    })
  },
  watch: {
    path () {
      this.form.path = this.path
    }
  },
  mounted () {
    document.querySelector('.search-box .sb-find input').focus()
    document.querySelectorAll('.search-box input[type=text]').forEach((item, index) => {
      item.setAttribute('tabindex', index + 1)
    })
    document.body.addEventListener('keydown', this.close, false)
  },
  destroyed () {
    document.body.removeEventListener('keydown', this.close, false)
  },
  methods: {
    close (e) {
      if (e.keyCode === 27) {
        store.dispatch('closeSearchBox')
      } else if (e.keyCode === 13) {
        // if (e.target.parentNode.className.includes('sb-find')) {
        this.find()
        // } else if (e.target.parentNode.className.includes('sb-replace')) {
        //   this.replace()
        // }
      }
    },
    find () {
      if (!this.form.find) {
        alert(lanObject.search.findEmpty)
        return
      }
      search(this.form, 'find')
    },
    replace () {
      if (!this.form.find) {
        alert(lanObject.search.findEmpty)
        return
      }
      if (!this.form.replace) {
        alert(lanObject.search.replaceEmpty)
        return
      }
      search(this.form, 'replace')
    }
  }
}
</script>