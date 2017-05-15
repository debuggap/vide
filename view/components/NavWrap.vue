<template>
  <div class="nav-wrap">
    	<nav-head></nav-head>
    	<nav-shortcut></nav-shortcut>
	</div>
</template>

<script>
import NavHead from './nav/NavHead'
import NavShortcut from './nav/NavShortcut'

export default {
  name: 'nav-wrap',
  components: {
    NavHead,
    NavShortcut
  }
}

</script>