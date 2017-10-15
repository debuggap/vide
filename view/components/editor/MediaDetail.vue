<template>
  <div class="media-detail" ref="mediaDetail">
    <img :src="url" v-if="type === 'image'" />
    <iframe :src="url" v-else></iframe>
  </div>
</template>

<script>
import 'assets/css/editor/media-detail.scss'
export default {
  name: 'media-detail',
  props: ['currentFile'],
  data () {
    return {
      type: ''
    }
  },
  computed: {
    url () {
      return 'file://' + this.currentFile + '?_t=' + Date.now()
    }
  },
  watch: {
    currentFile () {
      if (/\.pdf$/.test(this.currentFile)) {
        this.type = 'pdf'
      } else {
        this.type = 'image'
      }
    }
  }
}
</script>