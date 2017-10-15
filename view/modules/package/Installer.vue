<template>
  <div class="tool">
    <h2>Package tool :</h2>
    <el-radio-group v-model="radio" @change="handleChange">
      <el-radio class="radio" label="npm">NPM</el-radio>
      <el-radio class="radio" label="cnpm">CNPM</el-radio>
    </el-radio-group>
  </div>
</template>

<script>
import Vue from 'vue'
import {Radio, RadioGroup} from 'element-ui'
Vue.use(Radio)
Vue.use(RadioGroup)
export default {
  data () {
    let value = localStorage.packageTool ? localStorage.packageTool : 'npm'
    return {
      radio: value
    }
  },
  methods: {
    handleChange (value) {
      localStorage.packageTool = value
    }
  }
}
</script>