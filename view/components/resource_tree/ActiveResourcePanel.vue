<template>
  <div class="active-resource-panel">
    <resource-recent></resource-recent>
    <resource-project v-if="projectPath"></resource-project>
	</div>
</template>

<script>
import 'assets/css/resource/panel.scss'
import ResourceRecent from './ResourceRecent'
import ResourceProject from './ResourceProject'
import {mapState} from 'vuex'
export default {
  name: 'active-resource-panel',
  components: {
    ResourceRecent,
    ResourceProject
  },
  computed: {
    ...mapState({
      projectPath: state => state.projectPath
    })
  }
}

</script>