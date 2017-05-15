<template>
  <div class="content-wrap">
    <resource-panel></resource-panel>
    <resource-resize></resource-resize>
    <editor-wrap></editor-wrap>
    <filter-files></filter-files>
  </div>
</template>

<script>
import 'assets/css/content-wrap.scss'
import ResourcePanel from './resource_tree/ResourcePanel'
import ResourceResize from './resource_tree/ResourceResize'
import EditorWrap from './editor/EditorWrap'
import FilterFiles from './editor/FilterFiles'

export default {
  name: 'content-wrap',
  components: {
    ResourcePanel,
    ResourceResize,
    EditorWrap,
    FilterFiles
  }
}

</script>