<template>
  <div class="filter-files-selection" v-show="show" @click="clickMask">
    <div class="filter-files">
      <el-input v-model="name" @change="filter" placeholder="Find Files"></el-input> 
      <ul>
        <li v-for="(list, index) in lists" @click="gotoLine(list)" :class="{active: index === activeIndex}">
          <h3 v-html="list.name"></h3>
          <div v-html="list._filepath ? list._filepath : list.filepath"></div>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import 'assets/css/editor/filter-files.scss'
import signal from 'engine/signal'
import store from 'store'
import {mapState} from 'vuex'
import childProcess from 'engine/child_process'
import {gotoLine} from 'engine/editor'
import $ from 'jquery'
let results = []
let cache = []
let prevName = ''
let findTimeout = null
function search (cb) {
  if (!store.state.projectPath) {
    results = []
    return
  }
  childProcess.run({name: 'findFiles', src: 'findFiles', func: 'find'}, [store.state.projectPath], function (rt) {
    if (rt.data && rt.data.length) {
      results = results.concat(rt.data)
    }
  })
}
function movePosition (step) {
  let index = $('.filter-files-selection li.active').index() + step
  let top = Math.floor(index / 5) * 51 * 5
  $('.filter-files-selection ul')[0].scrollTop = top
}
// export component
export default {
  name: 'filter-files',
  data () {
    return {
      show: false,
      activeIndex: 0,
      lists: [],
      name: ''
    }
  },
  computed: {
    ...mapState({
      projectPath: state => state.projectPath
    })
  },
  watch: {
    projectPath () {
      this.lists = []
      search()
    }
  },
  methods: {
    clickMask (e) {
      if (e.target.closest('.filter-files')) {
        e.stopPropagation()
      } else {
        this.close()
      }
    },
    close () {
      this.show = false
    },
    showDialog () {
      this.show = true
      this.lists = results.slice(0, 5)
      this.name = ''
      setTimeout(() => {
        document.querySelector('.filter-files-selection input').focus()
      }, 0)
    },
    filter () {
      if (findTimeout) {
        clearTimeout(findTimeout)
      }
      findTimeout = setTimeout(() => {
        this._filter()
      }, 200)
    },
    _filter () {
      let mapResults = results
      if (prevName && this.name.indexOf(prevName) === 0 && cache) {
        mapResults = cache
      }
      let reg = this.name.replace(/[^0-9a-zA-Z]/g, function (value) { return '\\' + value })
      reg = new RegExp(reg, 'i')
      let rt = mapResults.filter((item) => {
        if (reg.test(item.name) || reg.test(item.filepath)) {
          return true
        }
      })
      if (rt.length) {
        cache = rt
        prevName = this.name
      } else {
        cache = null
        prevName = ''
      }
      rt = rt.map((item) => {
        return {
          filepath: item.filepath,
          _filepath: item.filepath.replace(reg, v => '<span class="highlight">' + v + '</span>'),
          name: item.name.replace(reg, v => '<span class="highlight">' + v + '</span>')
        }
      })
      this.lists = rt
      this.activeIndex = 0
      $('.filter-files-selection ul')[0].scrollTop = 0
    },
    gotoLine (item) {
      gotoLine(item.filepath)
      this.close()
    }
  },
  mounted () {
    let shiftCount = 0
    document.body.addEventListener('keydown', (e) => {
      if (e.keyCode === 16) {
        shiftCount++
        if (shiftCount === 2) {
          shiftCount = 0
          this.showDialog()
        } else {
          setTimeout(() => {
            shiftCount = 0
          }, 200)
        }
      }
      if (!this.show) {
        return
      }
      if (e.keyCode === 27) {
        this.close()
      } else if (e.keyCode === 38) {
        this.activeIndex--
        if (this.activeIndex < 0) {
          this.activeIndex = this.lists.length - 1
        }
        movePosition(-1)
        e.preventDefault()
      } else if (e.keyCode === 40) {
        this.activeIndex++
        if (this.activeIndex >= this.lists.length) {
          this.activeIndex = 0
        }
        movePosition(1)
        e.preventDefault()
      } else if (e.keyCode === 13) {
        if (this.lists[this.activeIndex]) {
          this.gotoLine(this.lists[this.activeIndex])
        }
      }
    }, false)
    signal.receive('openFindFiles', () => {
      this.showDialog()
    })
    search()
  }
}
</script>