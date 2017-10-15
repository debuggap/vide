<template>
  <div class="resource-recent">
    <h4 class="resource-title">FILES<span class="close" title="Close All"></span></h4>
    <div style="display:none">
      {{lists.length}}
      {{currentFile}}
      <span v-for="item in currentFiles">{{item['status']}}</span>
    </div>
    <ul ref="ul"></ul>
  </div>
</template>

<script>
import ResourceRecentItem from './ResourceRecentItem'
import Draggable from 'draggable'
import {mapState} from 'vuex'
import store from 'store'
import path from 'path'
import $ from 'jquery'

// drag对象，用于存储实例
let dragObject = []
// 记录拖动时的索引
let dragIndex = 0
// drag参数
let dragOption = {
  limit: {
    x: [0, 0]
  },
  onDrag (elem, x, y, event) {
    if (event.which !== 1) {
      return
    }
    let perHeight = elem.clientHeight
    let currentIndex = Math.round(y / perHeight)
    if (currentIndex > dragIndex) {
      // 向下移动
      let list = getListByTop(elem.parentNode)
      let needMoveElem = list[currentIndex]
      needMoveElem.style.top = (parseInt(needMoveElem.style.top) - perHeight) + 'px'
      dragIndex = currentIndex
    } else if (currentIndex < dragIndex) {
      // 向上移动
      let list = getListByTop(elem.parentNode)
      let needMoveElem = list[currentIndex]
      needMoveElem.style.top = (parseInt(needMoveElem.style.top) + perHeight) + 'px'
      dragIndex = currentIndex
    }
  },
  onDragStart (elem, x, y, event) {
    if (event.which !== 1) {
      return
    }
    dragIndex = Math.round(y / elem.clientHeight)
    event.preventDefault()
  },
  onDragEnd (elem, x, y, event) {
    if (event.which !== 1) {
      return
    }
    let domIndex = 0
    let elemCopy = elem
    while (elemCopy.previousElementSibling) {
      elemCopy = elemCopy.previousElementSibling
      domIndex++
    }
    // 设置正确的位置
    elem.style.top = (dragIndex * elem.clientHeight) + 'px'
    // 手动调换位置，而不是用vue的渲染机制
    if (dragIndex < domIndex) {
      $(elem.parentNode.children[domIndex]).insertBefore(elem.parentNode.children[dragIndex])
    } else if (dragIndex > domIndex) {
      $(elem.parentNode.children[domIndex]).insertAfter(elem.parentNode.children[dragIndex])
    }
    store.dispatch('resourceRecent/modifyOrder', { domIndex, dragIndex })
  }
}

// 根据top属性，返回列表
function getListByTop (node) {
  let children = node.children
  let list = []
  for (let i = 0; i < children.length; i++) {
    list.push(children[i])
  }
  // sort items according to top property
  list.sort(function (a, b) {
    if (parseInt(a.style.top) > parseInt(b.style.top)) {
      return 1
    } else {
      return -1
    }
  })
  return list
}

// 初始化的drag事件
function initDrag () {
  // destroy drag事件
  while (dragObject.length) {
    dragObject.pop().destroy()
  }
  let lis = this.$refs.ul.children
  let yLimit
  let perHeight = 0
  if (lis.length) {
    perHeight = lis[0].clientHeight
    yLimit = perHeight * (lis.length - 1)
  }
  let instance
  for (let i = 0; i < lis.length; i++) {
    // add draggable event
    instance = new Draggable(lis[i], dragOption)
    dragObject.push(instance)
    instance.set(0, perHeight * i)
    instance.setOption('limit', {x: [0, 0], y: [0, yLimit]})
  }
  this.$refs.ul.style.height = (perHeight * lis.length) + 'px'
}

// 创建列表，并添加draggable事件
function initList () {
  let lists = this.lists
  let result = ''
  let basename
  let dirname
  for (let i = 0; i < lists.length; i++) {
    if (/^(untitled|Search)/.test(lists[i])) {
      basename = lists[i]
      dirname = ''
    } else {
      let filepath = lists[i].replace(store.state.projectPath, '').replace(/^\//, '')
      basename = path.basename(filepath)
      dirname = path.dirname(filepath).split(path.sep).slice(-2).join(' / ').replace(/^\./, '')
    }
    let className = lists[i] === this.currentFile ? 'active' : ''
    let status = this.currentFiles[lists[i]]['status']
    !status && (status = '')
    result += `<li title=${lists[i]} class="${className}">
      <i class="el-icon-circle-close close"></i>
      <span class="open-files-name">
        <i>${dirname}</i>&nbsp;
        <span class="ofn-basename">${basename}</span>
      </span>
      <span class="status">${status}</span>
    </li>`
  }
  this.$refs.ul.innerHTML = result
  // 初始化拖动事件
  initDrag.call(this)
}

// 创建li的单击事件
function initClickEvent () {
  this.$refs.ul.addEventListener('click', (event) => {
    let item = event.target.closest('li')
    if (!item) {
      return
    }
    let index = $(item).index()
    let file = this.lists[index]
    if (event.target.className.split(' ').includes('close')) {
      this.$store.dispatch('resourceRecent/deleteItem', file)
    } else {
      this.$store.dispatch('editor/setFile', {currentFile: file})
    }
  }, false)
}

export default {
  name: 'resource-recent',
  computed: {
    ...mapState({
      lists: state => state.resourceRecent.lists,
      currentFile: state => state.editor.currentFile,
      currentFiles: state => state.resourceRecent.currentFiles
    })
  },
  mounted () {
    initList.call(this)
    initClickEvent.call(this)
  },
  updated () {
    initList.call(this)
  },
  components: {
    ResourceRecentItem
  }
}
</script>
