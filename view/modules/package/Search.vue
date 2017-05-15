<template>
  <div class="search">
    <div style="margin-bottom:10px">
      <p>Packages are published to NPM and normally package is named by `vide-plugin-*`</p>
      <el-input v-model="packageName" @focus="focusPackageName" class="search-input" placeholder="Package Name"></el-input> 
      <el-button type="primary" @click="install" :disabled="loading" :loading="loading">Install</el-button>
    </div>
    <el-alert show-icon v-show="tip.title" :title="tip.title" :type="tip.type" @close="closeTip"></el-alert>
  </div>
</template>

<script>
import Vue from 'vue'
import {loadPackage, installPackage} from 'engine/package'
import {Input, Button, Alert} from 'element-ui'

Vue.use(Input)
Vue.use(Button)
Vue.use(Alert)

export default {
  name: 'package-search',
  data () {
    return {
      packageName: '',
      loading: false,
      npmInstalled: true,
      tip: {
        title: '',
        type: 'info'
      }
    }
  },
  methods: {
    async install () {
      if (!this.npmInstalled) {
        this.loadTip(`Please install npm or cnpm firstly`, 'warning')
        return
      }
      if (!this.packageName) {
        this.loadTip(`Enter package name`, 'warning')
        return
      }
      this.loading = true
      // load installed packages
      let packageLists = []
      if (localStorage.packageLists) {
        try {
          packageLists = JSON.parse(localStorage.packageLists)
        } catch (e) {}
      }
      // check if it's installed
      let exists = packageLists.some((item) => {
        return item.name === this.packageName
      })
      if (exists) {
        this.loadTip(`'${this.packageName}' has installed`, 'warning')
        return
      }
      let success = await installPackage(this.packageName)
      if (success !== true) {
        this.loadTip(`Installing '${this.packageName}' occurs error`, 'error')
        return
      }
      try {
        // install module
        let packageInfo = await loadPackage(this.packageName)
        // add to localStorage
        let item = {
          name: this.packageName,
          version: packageInfo.package.version,
          type: packageInfo.package.vide ? packageInfo.package.vide.type : ''
        }
        if (packageInfo.package.vide.modePath) {
          item.modePath = packageInfo.package.vide.modePath
        }
        packageLists.push(item)
        localStorage.packageLists = JSON.stringify(packageLists)
        // show successful tip
        this.loadTip(`Install '${this.packageName}' successfully`, 'success')
      } catch (e) {
        console.log(e)
        this.loadTip(`Loading '${this.packageName}' occurs error`, 'error')
      }
    },
    loadTip (title, type) {
      this.tip.title = title
      this.tip.type = type
      this.loading = false
    },
    closeTip () {
      this.tip.title = ''
    },
    focusPackageName (event) {
      event.target.select()
    }
  },
  mounted () {
    window.require('child_process').exec(`npm -v`, (e) => {
      this.npmInstalled = e === null
    })
  }
}
</script>

<style lang="scss" scoped>
.search{
  &-input{
    width:500px
  }
}
</style>