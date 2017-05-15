<template>
  <div class="resource-resize">
	</div>
</template>

<script>
import Draggable from 'draggable'
import {editor} from 'engine/editor'
export default {
  name: 'resource-resize',
  mounted () {
    // resize resource tree
    let xLimit = [250, 450]
    let option = {
      limit: {
        x: xLimit,
        y: [0, 0]
      },
      onDrag (elem, x, y, event) {
        document.querySelector('.resource-panel').style.width = x + 'px'
        document.querySelector('.content').style.left = x + 'px'
      },
      onDragStart (elem, x, y) {
        xLimit[1] = Math.floor(document.body.clientWidth / 2)
      },
      onDragEnd (elem, x, y) {
        // re-calculate editor size
        editor().resize()
        document.querySelector('.resource-panel').style.width = x + 'px'
        document.querySelector('.content').style.left = x + 'px'
        elem.style.left = x + 'px'
      }
    }
    return new Draggable(document.querySelector('.resource-resize'), option)
  }
}

</script>