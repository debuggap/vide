<template>
  <div class="theme-manage">
    <ul class="ui-lists">
      <item v-for="theme in themes" :theme="theme" :active="theme === active" @click.native="handleSelect(theme)"></item>
    </ul>
  </div>
</template>

<script>
import Item from './Item'
import {editor} from 'engine/editor'

export default {
  data () {
    let themes = ['chrome', 'monokai']
    let theme = localStorage.theme
    if (!themes.includes(theme)) {
      theme = 'monokai'
    }
    return {
      themes: themes,
      active: theme
    }
  },
  methods: {
    handleSelect (theme) {
      if (theme !== this.active) {
        localStorage.theme = theme
        this.active = theme
        editor().setTheme('ace/theme/' + theme)
        document.body.className = theme
      }
    }
  },
  components: {
    Item
  }
}
</script>

<style lang="scss" scoped>
.theme-manage {
  width: 800px;
  height: 500px;
  display:flex;
  
  .ui-lists {
    -webkit-user-select: none;
    width:946px;
    display: flex;
    justify-content: space-around;
  }
  .ui-lists pre{
    font-size:12px;
  }
  ul {
    float: left;
    margin: 0px;
    padding: 0px;
    margin-top:30px;
    margin-left:15px;
  }
  li {
    float: left;
    width: 280px;
    height: 300px;
    list-style-type: none;
    border: 1px solid #ccc;
    border-radius: 5px;
    margin-right: 20px;
    padding: 5px;
    cursor: pointer;
  }
  li:hover {
    -webkit-transform:scale(1.1);
    -webkit-transition: -webkit-transform 0.2s;
  }
  
}
</style>