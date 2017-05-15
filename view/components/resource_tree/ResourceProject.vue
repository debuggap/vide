<template>
  <div class="resource-project">
    <h4 class="resource-title">PROJECT</h4>
    <resource-tree :projectName="projectName" :projectPath="projectPath" active=true ></resource-tree>
  </div>
</template>

<script>
import ResourceTree from './ResourceTree'
import {mapState} from 'vuex'

export default {
  name: 'resource-project',
  computed: {
    ...mapState({
      projectPath: state => state.projectPath,
      projectName: state => state.projectName
    })
  },
  components: {
    ResourceTree
  }
}
</script>