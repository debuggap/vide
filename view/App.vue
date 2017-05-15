<template>
  <div>
    <nav-wrap></nav-wrap>
    <content-wrap></content-wrap>
    <status-wrap></status-wrap>
    <dynamic-component />
    <div id="package-box"></div>
  </div>
</template>

<script>
import NavWrap from './components/NavWrap'
import ContentWrap from './components/ContentWrap'
import StatusWrap from './components/StatusWrap'
import DynamicComponent from './components/DynamicComponent'

export default {
  name: 'app',
  components: {
    NavWrap,
    DynamicComponent,
    StatusWrap,
    ContentWrap
  }
}
</script>