<template>
  <div class="shortcut">
    <div class="shortcut-content">
      <table class="table">
        <tr>
          <th class="th">Command</th>
          <th class="th">Function</th>
          <th class="th">Source</th>
        </tr>
        <tr v-for="(item, index) in lists" :class="{tr: true, hidden: (item.hidden || item.filter) ? true : false}">
          <td><input @click="emptyInput(index)" @keyup="keyupInput(index, $event)" @keydown.stop.prevent="keydownInput(index, $event)" @blur="blurInput(index, $event)" class="input" type="text" :placeholder="item.placeholder | changeHotkeyIcon" :value="item.bindKey[platform] | changeHotkeyIcon" :data-value="item.bindKey[platform]" /></td>
          <td>{{item.func}}</td>
          <td>{{item.system ? 'system' : 'plugin'}}</td>
        </tr>
      </table>
    </div>
    <div class="shortcut-bar">
      <el-input v-model="name" class="search-input" @focus="focusName" @change="filter" placeholder="Filter"></el-input>
      <el-button type="primary" class="shortcut-save" @click="save">Save</el-button>
    </div>
  </div>
</template>

<script>
import platforms from 'engine/platforms'
import {changeHotkeyIcon, isValidKey, isValidCommand, overwriteHotkey} from 'engine/shortcut'

export default {
  name: 'shortcut',
  data () {
    let hotkeys = JSON.parse(JSON.stringify(this.$store.state.config.hotkeys))
    let lists = hotkeys.map((item) => {
      item.placeholder = item.bindKey[platforms.platform]
      return item
    })
    lists.sort(function (a, b) {
      return a.bindKey[platforms.platform] > b.bindKey[platforms.platform] ? 1 : -1
    })
    return {
      platform: platforms.platform,
      name: '',
      lists
    }
  },
  methods: {
    emptyInput (index) {
      this.lists[index]['bindKey'][this.platform] = ''
    },
    blurInput (index, event) {
      if (!event.target.value) {
        this.lists[index]['bindKey'][this.platform] = this.lists[index].placeholder
      }
    },
    keyupInput (index, e) {
      let value = this.lists[index]['bindKey'][this.platform]
      if (!isValidCommand(value)) {
        this.lists[index]['bindKey'][this.platform] = this.lists[index].placeholder
      } else {
        this.lists[index].placeholder = value
      }
      e.target.blur()
    },
    keydownInput (index, e) {
      let result = ''
      e.ctrlKey && (result += 'ctrl-')
      if (e.altKey) {
        if (platforms.platform === 'mac') {
          result += 'option-'
        } else {
          result += 'alt-'
        }
      }
      e.shiftKey && (result += 'shift-')
      if (platforms.platform === 'mac' && e.metaKey) {
        result += 'cmd-'
      }
      if (result) {
        if (isValidKey(e.keyCode)) {
          result += isValidKey(e.keyCode)
        }
      } else if (/f\d/i.test(e.key)) {
        result = isValidKey(e.keyCode)
      }
      if (!result) {
        e.preventDefault()
      } else {
        this.lists[index]['bindKey'][this.platform] = result
      }
      e.stopPropagation()
    },
    focusName (event) {
      event.target.select()
    },
    filter () {
      this.lists = this.lists.map((item) => {
        if (item.func.toLowerCase().includes(this.name) || item.bindKey[platforms.platform].toLowerCase().includes(this.name)) {
          this.$set(item, 'filter', 0)
        } else {
          this.$set(item, 'filter', 1)
        }
        return item
      })
    },
    save () {
      let lists = this.lists.map((item) => {
        if (typeof item.filter !== undefined) {
          delete item.filter
        }
        // incase some shortcut is missing
        if (!item.bindKey[platforms.platform] && item.placeholder) {
          item.bindKey[platforms.platform] = item.placeholder
        }
        delete item.placeholder
        return item
      })
      this.$store.dispatch('config/set', {'hotkeys': JSON.parse(JSON.stringify(lists))})
      overwriteHotkey()
    }
  },
  filters: {
    changeHotkeyIcon (value) {
      if (!value) {
        return ''
      }
      return changeHotkeyIcon(value)
    }
  }
}
</script>

<style lang="scss" scoped>
.shortcut {
  position: absolute;
  bottom: 0px;
  top: 0px;
  left: 5px;
  right: 5px;
  
  .table {
    width: 100%;
  }
  
  .tr {
    line-height: 28px;
  }
  
  .hidden {
    display:none
  }
  
  .th {
    text-align:left;
  }
  
  .input {
    width: 150px;
    border: 1px solid #838ba5;
    color:inherit;
    height: 20px;
    line-height: 20px;
    text-align: center;
    border-radius: 10px;
    outline: none;
  }
  
  &-content {
    position:absolute;
    top:0px;
    left:0px;
    right:0px;
    bottom:40px;
    overflow:auto;
  }
  
  &-bar {
    display:flex;
    position:absolute;
    bottom:0px;
    left:0px;
    right:0px;
  }
  
  &-save {
    flex-grow:1;
  }
  .search-input {
    width:80%;
    margin-right:10px
  }
  .search-save {
    flex-grow:1
  }
}
</style>