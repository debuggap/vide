<template>
  <div class="resource-panel">
    <resource-nav @change="change"></resource-nav>
    <active-resource-panel v-if="activeLoaded" :class="{'resource-panel-hidden': active !== 'active'}"></active-resource-panel>
    <all-resource-panel v-if="allLoaded" :class="{'resource-panel-hidden': active !== 'all'}"></all-resource-panel>
	</div>
</template>

<script>
import 'assets/css/resource/panel.scss'
import ResourceNav from './ResourceNav.vue'
import ActiveResourcePanel from './ActiveResourcePanel'
import AllResourcePanel from './AllResourcePanel'

export default {
  name: 'resource-panel',
  data () {
    return {
      active: 'active',
      activeLoaded: true,
      allLoaded: false
    }
  },
  components: {
    ResourceNav,
    ActiveResourcePanel,
    AllResourcePanel
  },
  methods: {
    change (type) {
      this.active = type
      if (type === 'all') {
        this.allLoaded = true
      }
    }
  }
}

</script>