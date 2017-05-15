<template>
  <div class="resource-nav">
    <span :class="{active: active === 'active'}" @click="select('active')">{{activeName}}</span>
    <span :class="{active: active === 'all'}" @click="select('all')">{{allName}}</span>
	</div>
</template>

<script>
import 'assets/css/resource/nav.scss'
import lanObject from 'engine/language'
import signal from 'engine/signal'

export default {
  name: 'resource-nav',
  data () {
    return {
      active: 'active',
      activeName: lanObject.resourceTree.activeProject,
      allName: lanObject.resourceTree.allProjects
    }
  },
  methods: {
    select (type) {
      if (this.active !== type) {
        this.active = type
        this.$emit('change', type)
      }
    }
  },
  mounted () {
    signal.receive('gotoActiveProject', () => {
      this.select('active')
    })
  }
}

</script>