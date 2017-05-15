<template>
  <div class="all-resource-panel">
    <resource-tree v-for="(value, name) in projects" :projectName="name" :projectPath="value" :key="value" :active=false></resource-tree>
	</div>
</template>

<script>
import 'assets/css/resource/panel.scss'
import ResourceTree from './ResourceTree'
import {getProjects} from 'engine/project'
import signal from 'engine/signal'

function receive () {
  let projects = getProjects()
  let keys = Object.keys(projects)
  keys.sort(function (a, b) { return a.toLowerCase() >= b.toLowerCase() ? 1 : -1 })
  let result = {}
  keys.forEach((key) => {
    result[key] = projects[key].path
  })
  return result
}
export default {
  name: 'all-resource-panel',
  data () {
    return {
      projects: receive()
    }
  },
  components: {
    ResourceTree
  },
  mounted () {
    signal.receive('reloadAllProjects', (name) => {
      this.$delete(this.projects, name)
    })
  }
}

</script>