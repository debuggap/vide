<template>
  <div class="tool">
    <h2>Language :</h2>
    <el-radio-group v-model="radio" @change="handleChange">
      <el-radio class="radio" label="en_us">English</el-radio>
      <el-radio class="radio" label="zh_cn">简体中文</el-radio>
    </el-radio-group>
    <el-alert show-icon class="alert" v-show="languageTip" :title="languageTip" type="info" :closable="false"></el-alert>
  </div>
</template>

<script>
import Vue from 'vue'
import {Radio, RadioGroup, Alert} from 'element-ui'
Vue.use(Radio)
Vue.use(RadioGroup)
Vue.use(Alert)
export default {
  name: 'language',
  data () {
    let value = localStorage.language ? localStorage.language : 'npm'
    return {
      radio: value,
      languageTip: ''
    }
  },
  methods: {
    handleChange (value) {
      this.languageTip = 'restart IDE to take effect'
      localStorage.language = value
      setTimeout(() => {
        this.languageTip = ''
      }, 2000)
    }
  }
}
</script>

<style lang="scss" scoped>
.tool{
  .alert{
    margin-top: 20px
  }
}
</style>