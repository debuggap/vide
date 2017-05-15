<template>
  <div class="image-detail" ref="imageDetail">
    <img :src="url" />
  </div>
</template>

<script>
import 'assets/css/editor/image-detail.scss'
import {mapState} from 'vuex'
import store from 'store'
export default {
  name: 'image-detail',
  data () {
    let url = 'file://' + store.state.editor.currentFile + '?_t=' + new Date().getTime()
    return {
      url: url
    }
  },
  computed: {
    ...mapState({
      showSearchBox: state => state.search.showSearchBox
    })
  },
  watch: {
    showSearchBox () {
      this.resetSize()
    }
  },
  methods: {
    resetSize () {
      if (this.showSearchBox) {
        this.$refs.imageDetail.style.bottom = '160px'
      } else {
        this.$refs.imageDetail.style.bottom = '0px'
      }
    }
  }
}
</script>