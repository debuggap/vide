<template>
  <div class="search-box">
    <el-form ref="form" :model="form" label-width="0px">
      <el-form-item class="search-flag-row">
        <el-tooltip v-if="findType === 'findInFile'" class="item" effect="light" popper-class="search-flag-tooltip" content="Find Next" placement="top-start">
          <el-button type="primary" class="ext-button" @click="findNext"><i class="el-icon-arrow-down"></i></el-button>
        </el-tooltip>
        <el-tooltip v-if="findType === 'findInFile'" class="item" effect="light" popper-class="search-flag-tooltip" content="Find Previous" placement="top-start">
          <el-button type="primary" class="ext-button" @click="findPrevious"><i class="el-icon-arrow-up"></i></el-button>
        </el-tooltip>
        <el-tooltip v-if="findType === 'findInFile'" class="item" effect="light" popper-class="search-flag-tooltip" content="Find All" placement="top-start">
          <el-button type="primary" class="ext-button" @click="findAll">Find All</el-button>
        </el-tooltip>
        <el-tooltip v-if="findType === 'findInFile'" class="item" effect="light" popper-class="search-flag-tooltip" content="Replace All" placement="top-start">
          <el-button type="primary" class="ext-button" @click="replaceAll">Replace All</el-button>
        </el-tooltip>
        
        <el-tooltip class="item" effect="light" popper-class="search-flag-tooltip" content="Use Regex" placement="top-start">
          <el-button type="primary" :class="[{ active: form.regFlag }, 'search-flag']" @click="form.regFlag = !form.regFlag">.*</el-button>
        </el-tooltip>
        <el-tooltip class="item" effect="light" popper-class="search-flag-tooltip" content="Match Case" placement="top-start">
          <el-button type="primary" :class="[{ active: form.ignoreFlag }, 'search-flag']" @click="form.ignoreFlag = !form.ignoreFlag">Aa</el-button>
        </el-tooltip>
        <el-tooltip class="item" effect="light" popper-class="search-flag-tooltip" content="Whole Word" placement="top-start">
          <el-button type="primary" :class="[{ active: form.wholeFlag }, 'search-flag']" @click="form.wholeFlag = !form.wholeFlag">\b</el-button>
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
      <el-form-item v-if="findType === 'findInProject'">
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
import {editor} from 'engine/editor'
import signal from 'engine/signal'
Vue.use(Form)
Vue.use(FormItem)
Vue.use(Input)
Vue.use(Button)
Vue.use(Tooltip)
export default {
  name: 'search',
  data () {
    let find = editor().getSelectedText().split('\n').pop()
    return {
      form: {
        find: find,
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
      },
      findType (state) {
        return state.search.params.type
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
    // focus input
    signal.receive('search:focus_input', () => {
      let find = editor().getSelectedText().split('\n').pop()
      if (find) {
        this.form.find = find
      }
      process.nextTick(this.focusInput)
    })
    process.nextTick(this.focusInput)
  },
  destroyed () {
    document.body.removeEventListener('keydown', this.close, false)
    // remove signal
    signal.remove('search:focus_input')
  },
  methods: {
    focusInput () {
      // try to focus find input
      try {
        let input = document.querySelector('.search-box .sb-find input')
        input.focus()
        input.select()
      } catch (e) {}
    },
    close (e) {
      if (e.keyCode === 27) {
        store.dispatch('closeSearchBox')
      } else if (e.keyCode === 13) {
        if (e.target.closest('.search-box')) {
          this.find()
          e.preventDefault()
          e.stopPropagation()
        }
      }
    },
    _getFindOption () {
      return {
        caseSensitive: this.form.ignoreFlag,
        regExp: this.form.regFlag,
        wrap: true,
        wholeWord: this.form.wholeFlag,
        backwards: false,
        skipCurrent: true
      }
    },
    findNext () {
      let option = this._getFindOption()
      option.backwards = false
      this._doFind(option)
    },
    findPrevious () {
      let option = this._getFindOption()
      option.backwards = true
      this._doFind(option)
    },
    findAll () {
      let option = this._getFindOption()
      editor().findAll(this.form.find, option)
    },
    _doFind (option) {
      editor().find(this.form.find, option)
    },
    find () {
      if (!this.form.find) {
        alert(lanObject.search.findEmpty)
        return
      }
      if (this.findType === 'findInProject') {
        search(this.form, 'find')
      } else {
        let option = this._getFindOption()
        this._doFind(option)
      }
    },
    _doReplace () {
      if (!this.form.find) {
        alert(lanObject.search.findEmpty)
        return
      }
      let option = this._getFindOption()
      option.backwards = false
      editor().find(this.form.find, option)
      editor().replace(this.form.replace)
    },
    replaceAll () {
      if (!this.form.find) {
        alert(lanObject.search.findEmpty)
        return
      }
      editor().find(this.form.find)
      editor().replaceAll(this.form.replace)
    },
    replace () {
      if (!this.form.find) {
        alert(lanObject.search.findEmpty)
        return
      }
      if (this.findType === 'findInProject') {
        search(this.form, 'replace')
      } else {
        this._doReplace()
      }
    }
  }
}
</script>