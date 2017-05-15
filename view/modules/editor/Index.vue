<template>
  <div class="package-manage">
    <div class="package-manage-nav">
      <el-menu default-active="1" class="el-menu-vertical-demo" @select="handleSelect">
        <el-menu-item index="1">Basic</el-menu-item>
        <el-menu-item index="2">Language</el-menu-item>
        <el-menu-item index="3">Shortcut</el-menu-item>
      </el-menu>
    </div>
    <div class="package-manage-content">
      <basic v-if="currentIndex == 1"></basic>
      <language v-else-if="currentIndex == 2"></language>
      <shortcut v-else-if="currentIndex == 3"></shortcut>
    </div>
  </div>
</template>

<script>
import Vue from 'vue'
import Basic from './Basic'
import Language from './Language'
import Shortcut from './Shortcut'
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
    Basic,
    Shortcut,
    Language
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
    position: relative;
  }
}
</style>