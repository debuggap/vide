<template>
  <div class="nav-shortcut">
    	<div v-for="item in packageLists" class="nav-shortcut-item" :title="item.desc ? item.desc : item.name">
    	  <img :src="item.icon" v-if="item.icon" />
    	  <span v-else>{{item.name}}</span>
    	</div>
	</div>
</template>

<script>
import {mapState} from 'vuex'
import {runPackageEvent} from 'engine/package'
import $ from 'jquery'
import 'assets/css/nav/nav-shortcut.scss'

export default {
  name: 'nav-shortcut',
  computed: {
    ...mapState({
      packageLists: state => state.toolbar.lists
    })
  },
  methods: {
    launch (index) {
      let item = this.packageLists[index]
      runPackageEvent(item.func, [item])
    },
    longTap (index) {
      let item = this.packageLists[index]
      if (item.longTap) {
        runPackageEvent(item.longTap, [item])
      }
    }
  },
  mounted () {
    let instance = null
    let longTap = false
    $('.nav-shortcut').on('mousedown', '.nav-shortcut-item', (e) => {
      instance = setTimeout(() => {
        instance = null
        longTap = true
        this.longTap($(e.target).index())
      }, 1000)
    })
    $('.nav-shortcut').on('mouseup', '.nav-shortcut-item', (e) => {
      if (instance) {
        clearTimeout(instance)
        instance = null
        longTap = false
      }
    })
    $('.nav-shortcut').on('click', '.nav-shortcut-item', (e) => {
      if (!longTap) {
        this.launch($(e.target).index())
      }
    })
  }
}

</script>