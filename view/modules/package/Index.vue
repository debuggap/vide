<template>
  <div class="package-manage">
    <div class="package-manage-nav">
      <el-menu default-active="1" class="el-menu-vertical-demo" @select="handleSelect">
        <el-menu-item index="1">Search</el-menu-item>
        <el-menu-item index="2">Installed</el-menu-item>
        <el-menu-item index="3">Tool</el-menu-item>
      </el-menu>
    </div>
    <div class="package-manage-content">
      <search v-if="currentIndex == 1"></search>
      <installed v-else-if="currentIndex == 2"></installed>
      <tool v-else ></tool>
    </div>
  </div>
</template>

<script>
import Vue from 'vue'
import Installed from './Installed'
import Search from './Search'
import Tool from './Tool'
import {Menu, MenuItem} from 'element-ui'
Vue.use(Menu)
Vue.use(MenuItem)

export default {
  data () {
    return {
      currentIndex: 1
    }
  },
  methods: {
    handleSelect (key, keyPath) {
      this.currentIndex = key
    }
  },
  components: {
    Installed,
    Search,
    Tool
  }
}
</script>

<style lang="scss" scoped>
.package-manage {
  width: 800px;
  height: 600px;
  display:flex;
  
  &-nav{
    width:100px;
    height:100%;
    background-color:#eef1f6;
  }
  
  &-content{
    padding: 10px;
    flex-grow:1;
  }
}
</style>