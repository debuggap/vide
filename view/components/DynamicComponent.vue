<template>
  <div v-show="componentId" class="dynamic-component-cover">
    <div class="dynamic-component">
      <div class="dynamic-component-top"><i class="el-icon-circle-close" @click="closeDynamicComponent"></i></div>
      <component :is="componentId" class="dynamic-component-box"></component>
    </div>
  </div>
</template>

<script>
import store from 'store'
import 'assets/css/dynamic-component.scss'

export default {
  name: 'dynamic-component',
  computed: {
    componentId () {
      return store.state.dynamicComponent
    }
  },
  watch: {
    componentId () {
      if (this.componentId) {
        this.$nextTick(() => {
          let dom = document.querySelector('.dynamic-component-box')
          dom.parentNode.style.width = dom.offsetWidth + 'px'
          dom.parentNode.style.height = (dom.offsetHeight + 20) + 'px'
          dom.parentNode.style.marginLeft = (-1 * Math.floor(dom.offsetWidth / 2)) + 'px'
          dom.parentNode.style.marginTop = (-1 * Math.floor(dom.offsetHeight / 2)) + 'px'
        })
        document.body.addEventListener('keyup', this.escClose, false)
      } else {
        document.body.removeEventListener('keyup', this.escClose, false)
      }
    }
  },
  methods: {
    closeDynamicComponent () {
      store.dispatch('closeDynamicComponent')
    },
    escClose (e) {
      if (e.keyCode === 27) {
        this.closeDynamicComponent()
      }
    }
  }
}
</script>
