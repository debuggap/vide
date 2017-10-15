<template>
  <div class="search">
    <div style="margin-bottom:10px">
      <el-alert show-icon v-show="tip.title" :title="tip.title" :type="tip.type" @close="closeTip"></el-alert>
      <p>Packages are published to NPM and normally package is named by `vide-plugin-*`</p>
      <el-autocomplete
      custom-item="NpmPackageItem"
      class="search-input"
      v-model="packageName"
      :fetch-suggestions="querySearch"
      placeholder="Package Name"
      @select="handleSelect"
      :trigger-on-focus="false"
      :disabled="loading"
      ></el-autocomplete>
      <el-button type="primary" @click="install" :disabled="loading" :loading="loading">Install</el-button>
    </div>
    <h3 class="bucket-title">Bucket (Install related packages)</h3>
    <div class="bucket-selection">
      <el-radio-group v-model="bucketName" @change="addBucketName">
        <el-radio class="bucket-item" label="vide-plugin-bucket-common">Common [vide-plugin-bucket-common]</el-radio>
        <el-radio class="bucket-item" label="vide-plugin-bucket-vue">Vue [vide-plugin-bucket-vue]</el-radio>
        <el-radio class="bucket-item" label="vide-plugin-bucket-weixin">Weixin [vide-plugin-bucket-weixin]</el-radio>
        <el-radio class="bucket-item" label="vide-plugin-bucket-zhifubao">Alipay [vide-plugin-bucket-zhifubao]</el-radio>
      </el-radio-group>
    </div>
  </div>
</template>

<script>
import Vue from 'vue'
import {loadPackage, installPackage, loadBucket, savePackageInfo} from 'engine/package'
import {getLocalStorage} from 'engine/localStorage'
import NpmPackageItem from './NpmPackageItem'
import {Input, Autocomplete, Button, Alert, Radio, RadioGroup} from 'element-ui'

Vue.component('NpmPackageItem', NpmPackageItem)
Vue.use(Input)
Vue.use(Autocomplete)
Vue.use(Button)
Vue.use(Alert)
Vue.use(Radio)
Vue.use(RadioGroup)

export default {
  name: 'package-search',
  data () {
    return {
      packageName: '',
      loading: false,
      npmInstalled: true,
      bucketName: '',
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
      if (!/^vide-plugin/.test(this.packageName)) {
        this.packageName = 'vide-plugin-' + this.packageName
      }
      this.loading = true
      // load installed packages
      let packageLists = getLocalStorage('packageLists', true) || []
      // check if it's installed
      let exists = packageLists.some((item) => {
        return item.name === this.packageName
      })
      if (exists) {
        this.loadTip(`'${this.packageName}' has installed`, 'warning')
        return
      }
      let success = await installPackage(this.packageName, false)
      if (success !== true) {
        this.loadTip(`Installing '${this.packageName}' occurs error`, 'error')
        return
      }
      if (/vide-plugin-bucket/.test(this.packageName)) {
        let result = await loadBucket(this.packageName)
        if (result && result.error.length) {
          let str = result.error.join(',')
          this.loadTip(`Loading ${this.packageName} [${str}] occurs error`, 'error')
        } else {
          this.loadTip(`Install ${this.packageName} successfully`, 'success')
        }
        this.loading = false
        return
      }
      try {
        // install module
        let packageInfo = await loadPackage(this.packageName)
        // add to localStorage
        savePackageInfo(packageInfo)
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
    },
    loadNpmLists () {
      if (process.npmLists) {
        return
      }
      // load related
      let keyword = encodeURIComponent('vide-plugin')
      let url = `https://registry.npmjs.org/-/_view/byKeyword?startkey=[%22${keyword}%22]&endkey=[%22${keyword}%22,%7B%7D]&group_level=3`
      fetch(url).then((a) => {
        return a.json()
      }).then((result) => {
        if (result && result.rows) {
          // store in the process, as when vide closes, the data will be gone
          process.npmLists = result.rows.map((item) => {
            return {
              name: item.key[1],
              desc: item.key[2]
            }
          })
        }
      })
    },
    querySearch (str, cb) {
      let result = []
      if (process.npmLists) {
        process.npmLists.some((item) => {
          if (item.name.includes(str) || item.desc && item.desc.includes(str)) {
            result.push(item)
          }
          if (result.length >= 30) {
            return true
          }
        })
      }
      cb(result)
    },
    handleSelect (item) {
      this.packageName = item.name
    },
    addBucketName () {
      if (this.bucketName) {
        this.packageName = this.bucketName
      }
    }
  },
  mounted () {
    window.require('child_process').exec(`npm -v`, (e) => {
      this.npmInstalled = e === null
    })
    // load vide-plugin lists
    this.loadNpmLists()
  }
}
</script>

<style lang="scss" scoped>
.search{
  .bucket-title {
    margin-top:30px;
  }
  .bucket-selection {
    margin-top:10px;
  }
  &-input{
    width:500px
  }
  .bucket-item {
    margin-left: 0px;
    display: block;
    height: 30px;
  }
}
</style>