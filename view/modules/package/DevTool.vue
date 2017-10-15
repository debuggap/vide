<template>
  <div class="devtool">
    <div style="margin-bottom:10px">
      <p>Dev tool is for developers who are developing plugins</p>
      <el-input v-model="path" @focus="focusInput" class="devtool-input" placeholder="Package path that you want to load"></el-input> 
      <el-button type="primary" @click="loadPackage">Load Package</el-button>
    </div>
    <el-alert show-icon v-show="tip.title" :title="tip.title" :type="tip.type" @close="closeTip"></el-alert>
    <ul>
      <li v-for="(list, index) in lists">{{list.path}}
        <el-tooltip class="item" effect="light" popper-class="search-flag-tooltip" content="Reload this plugin" placement="top-start">
          <span @click="reload(index)"></span>
        </el-tooltip>
        <el-tooltip class="item" effect="light" popper-class="search-flag-tooltip" content="Close this plugin" placement="top-start">
          <i class="el-icon-close" @click="remove(index)"></i>
        </el-tooltip>
      </li>
    </ul>
  </div>
</template>

<script>
import {isDirectory} from 'engine/helper/file_helper'
import {loadPackage, cleanPackage} from 'engine/package'

export default {
  name: 'package-search',
  data () {
    let lists = []
    try {
      lists = JSON.parse(localStorage.devPackageLists)
    } catch (e) {
      lists = []
    }
    return {
      path: '',
      lists: lists,
      tip: {
        title: '',
        type: 'info'
      }
    }
  },
  methods: {
    focusInput (event) {
      event.target.select()
    },
    loadTip (title, type, autoClose = 1) {
      this.tip.title = title
      this.tip.type = type
      if (autoClose) {
        setTimeout(() => {
          this.tip.title = ''
        }, 2000)
      }
    },
    async loadPackage (packagePath) {
      packagePath = typeof packagePath === 'string' ? packagePath : this.path
      if (!packagePath) {
        this.loadTip('Path is empty', 'error')
        return
      }
      if (!await isDirectory(packagePath)) {
        this.loadTip("Package doesn't exist", 'error')
        return
      }
      if (!this.lists.some((list) => { return list.path === packagePath })) {
        let packageInfo = await loadPackage(packagePath)
        // add to localStorage
        let item = {
          name: packageInfo.package.name,
          path: packagePath,
          version: packageInfo.package.version,
          type: packageInfo.package.vide ? packageInfo.package.vide.type : ''
        }
        if (packageInfo.package.vide.modePath) {
          item.modePath = packageInfo.package.vide.modePath
        }
        this.lists.push(item)
        localStorage.devPackageLists = JSON.stringify(this.lists)
      }
    },
    closeTip () {
      this.tip.title = ''
    },
    remove (index) {
      cleanPackage(this.lists[index])
      this.lists.splice(index, 1)
      localStorage.devPackageLists = JSON.stringify(this.lists)
    },
    reload (index) {
      let packagePath = this.lists[index].path
      this.remove(index)
      this.loadPackage(packagePath)
    }
  }
}
</script>

<style lang="scss" scoped>
.devtool{
  &-input{
    width:500px;
  }
  ul{
    width:100%;
    margin-top:20px;
    li {
      position:relative;
      border-bottom: 1px dotted #ccc;
      padding-bottom: 5px;
      margin-top: 5px;
      
      span{
        background-image:url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADMAAAAzCAYAAAA6oTAqAAADTklEQVR42u2aS2wOURTHx6Oh0aLinWgpSrAhGoRU49HEM1qvjdCQYGUhtSoJUQslaRAWQhMRuiFRFiwIwoJUgooolQgNDfV+VvnwP5kzyc3N9c1MO3NnbjIn+a2+mXPvmXvuOeee+1lWIokkkkgA0gcUgJlgISgDK8BSMBdMBkNB9zgbMRVUgjPgFngCWsE78AG8Ac/BfXAZHAVrwKC4GEBftxhcA+9BO/gD/rpAz/wGX8ELUAUGRmnERHACfPcw8ZSLkfTbM7ABDNBpSA7YyG6kmhSt0B1QD2rBIVADjoBT7GLNoEPx/jdwGhTqMGQYT+6TYiK0H6rBIl61waCX8G43kA3ywDSwHlxgA+QP0ghWhhkk+oHj4KfkMuRme3gjZ/jQR8Zl8p5rVBjUApbzc4FKb/7qKWFAMuomKApgQPoIu8BraYxmDvGBSU9QAX4Jg6TY/8cHOE4mh+qn0io1gPygBlnMX0x0gWOc+IIWWqEF4K00Xj0b2yUZAi5Ke4Q2bd+QA808zlnOmD/A5q7mkrVC5CKDHoPpGqJmD7Cb96Uz9g2Q21mFlLzOSzlghxRuw5SxHGAcr/gIyjsbrqnW+iwY0wRGaUzOtDpbwRdhdeo4afuWammvVEVQNuVLlcYrMNqvEsobDwUlHQGHYT9yUgrVq/wqGCHllXsRVuarJWMO+1WwTFJQo3HyWWCOQKU0lxaen/hMXjqFFZKCco3GDOfKOyWgOlI40Lmo1G3ziwpKNLvWbPDSwyGPDnc73ZQdkF4qiuDwRxm/LY0h7VxW9fcSlqNcGYtLpv1cyqgOgVfAGC+Kotwz8hnqquLITSs2xauS0gijmSpxPhAMauP2lWfJlfLM3Yi7QFTcPuKW1RaTKwAnIJRw9ybL1NosMClUVM0jTTUm6vNM4H66TjppNnHPy0ihHsAlRQ8g21SDlmjszoQu1DfbpqFvpk2oZ7XPCq+jqV2oOq3lBKrqNdP9SoZJBrndAuy17Ku/CZbdSI99GKf8s8mym9r/u5+h/vA5y741OMgrNyPOOWiS5f3mjFyTOpIFcU+sxeA6V7Tp7jTp7nK+KfuJOqDbwVlwm92wld2ObpzruFlhlND/AMaBWZZ9JVjGGFukJpJIIgbJP9ZLcnxBuWsFAAAAAElFTkSuQmCC);
        display: inline-block;
        width: 18px;
        height: 18px;
        background-size: cover;
        position: absolute;
        right: 30px;
        top: -4px;
      }
      
      i{
        position:absolute;
        right:10px;
        color:black;
      }
    }
  }
}
</style>