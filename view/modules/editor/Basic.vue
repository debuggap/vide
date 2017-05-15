<template>
  <div class="basic">
    <el-form ref="form" :model="form" label-width="80px">
      <el-form-item label="Tab Size">
        <el-input v-model="form.tabsize" placeholder="2"></el-input>
      </el-form-item>
      <el-form-item label="Font Size">
        <el-input v-model="form.fontsize" placeholder="12"></el-input>
      </el-form-item>
      <el-form-item  class="submit-item">
        <el-button type="primary" @click="onSubmit">Submit</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import Vue from 'vue'
import store from 'store'
import {Form, FormItem, Input, Button} from 'element-ui'
import {setEditor} from 'engine/editor'
Vue.use(Form)
Vue.use(FormItem)
Vue.use(Input)
Vue.use(Button)
export default {
  name: 'basic',
  data () {
    return {
      form: {
        tabsize: store.state.config.editor.tabsize,
        fontsize: store.state.config.editor.fontsize
      }
    }
  },
  methods: {
    onSubmit () {
      let setting = {}
      for (let i in this.form) {
        setting['editor.' + i] = parseInt(this.form[i])
      }
      setEditor()
      store.dispatch('config/set', setting)
    }
  }
}
</script>

<style lang="scss" scoped>
.basic {
  .submit-item {
    text-align:right
  }
}
</style>