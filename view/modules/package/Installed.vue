<template>
  <div class="installed">
    <div style="margin-bottom:10px">
      <el-input v-model="packageName" class="search-input" @focus="focusPackageName" @change="filter" placeholder="Filter Package Name"></el-input> 
    </div>
    <h2>Package Lists</h2>
    <ul>
      <li v-for="(list, index) in lists" :key="list.name">
        <h4>{{list.name}}@{{list.version}}</h4>
        <el-button type="primary" class="package-uninstall" :loading="uninstalls[index]" size="small" @click="uninstall(list, index)">Uninstall</el-button>
      </li>
    </ul>
  </div>
</template>

<script>
import Vue from 'vue'
import {Button} from 'element-ui'
import {uninstallPackage, cleanPackage} from 'engine/package'
import {confirm} from 'engine/message_box'
import lanObject from 'engine/language'
Vue.use(Button)
export default {
  name: 'package-installed',
  data () {
    let lists = []
    try {
      lists = JSON.parse(localStorage.packageLists)
    } catch (e) {}
    let uninstalls = {}
    for (let i = 0; i < lists.length; i++) {
      uninstalls[i] = false
    }
    return {
      packageName: '',
      lists,
      uninstalls
    }
  },
  methods: {
    async uninstall (item, index) {
      try {
        await confirm(lanObject.package.confirmRemove)
      } catch (e) {
        return
      }
      this.uninstalls[index] = true
      let success = await uninstallPackage(item.name)
      if (success === true) {
        cleanPackage(item)
        this.lists.splice(index, 1)
        this.$delete(this.uninstalls, index)
        localStorage.packageLists = JSON.stringify(this.lists)
      } else {
        this.uninstalls[index] = false
      }
    },
    filter () {
      let lists = []
      try {
        lists = JSON.parse(localStorage.packageLists)
      } catch (e) {}
      lists = lists.filter((item) => {
        return item.name.includes(this.packageName)
      })
      let uninstalls = {}
      for (let i = 0; i < lists.length; i++) {
        uninstalls[i] = false
      }
      this.lists = lists
      this.uninstalls = uninstalls
    },
    focusPackageName (event) {
      event.target.select()
    }
  }
}
</script>

<style lang="scss" scoped>
.installed {
  ul {
    height: 510px;
    overflow: auto;
  }
  li{
    border: 1px solid #d1dbe5;
    border-radius: 4px;
    background-color: inherit;
    color:inherit;
    overflow: hidden;
    box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.12), 0 0 6px 0 rgba(0, 0, 0, 0.04);
    min-height: 50px;
    padding: 10px;
    box-sizing: border-box;
    margin-bottom: 10px;
    position:relative;
    
    h4{
      margin:0px;
      color: rgb(131, 139, 165);
      font-weight:normal
    }
    
    .package-uninstall {
      position:absolute;
      right:10px;
      bottom:10px
    }
    .package-update {
      position:absolute;
      bottom: 10px;
      right: 100px
    }
  }
}
</style>