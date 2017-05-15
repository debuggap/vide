<template>
  <div class="search-result-box" ref="searchResultBox">
    <div class="search-result-bar">
      <el-button type="primary" :icon="loading ? 'loading' : ''" class="sr-stop" :disabled="!loading" size="mini" @click="stopSearch">Stop</el-button>
      <span class="sr-span">{{matches}} results in {{files}} files</span><span class="sr-span">Searched: {{searched}} files</span>
      <el-button type="primary" size="mini" @click="collapseAll">Collapse All</el-button>
      <el-button type="primary" size="mini" @click="expandAll">Expand All</el-button>
    </div>
    <div class="search-result-lists" @click="clickResult"></div>
  </div>
</template>

<script>
import 'assets/css/editor/search.scss'
import {mapState} from 'vuex'
import signal from 'engine/signal'
import $ from 'jquery'
import {htmlspecialchars} from 'engine/string'
import {gotoLine} from 'engine/editor'
import childProcess from 'engine/child_process'
import Vue from 'vue'
import {Button} from 'element-ui'
Vue.use(Button)

function addSearchItem (lists, reg) {
  for (let i = 0; i < lists.length; i++) {
    let list = lists[i]
    let match = list.match
    let lis = match.map((item) => {
      let line = htmlspecialchars(item.line)
      line = line.replace(reg, function (item) {
        return '<span class="highlight-result">' + item + '</span>'
      })
      return `<li><span>${item.row}</span> : <span>${line}</span></li>`
    })
    if (list.count > list.match.length) {
      lis.push(`<li class="more-search-result">---more---</li>`)
    }
    lis = lis.join('')
    let str = `
      <div class="file-section" data-path="${list.filepath}">
        <h5><i class="el-icon-caret-bottom"></i>${list.filepath} (${list.count})</h5>
        <ul>
          ${lis}
        </ul>
      </div>
    `
    $('.search-result-lists').append(str)
  }
}

export default {
  name: 'search-result',
  data () {
    return {
      matches: 0,
      files: 0,
      searched: 0,
      loading: false
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
        this.$refs.searchResultBox.style.bottom = '160px'
      } else {
        this.$refs.searchResultBox.style.bottom = '0px'
      }
    },
    reset () {
      this.loading = true
      this.matches = 0
      this.files = 0
      this.searched = 0
    },
    setResult (rt) {
      if (rt.done) {
        this.searched = rt.done
      }
      if (rt.data) {
        this.files += rt.data.length
        rt.data.forEach((item) => {
          this.matches += item.count
        })
      }
    },
    stopSearch () {
      this.loading = false
      childProcess.stop('search')
    },
    clickResult (e) {
      if (e.target.closest('H5')) {
        let h5 = e.target.closest('h5')
        if ($(h5).find('i').hasClass('el-icon-caret-bottom')) {
          $(h5).find('i').removeClass('el-icon-caret-bottom').addClass('el-icon-caret-right')
          $(h5).next().hide()
        } else {
          $(h5).find('i').removeClass('el-icon-caret-right').addClass('el-icon-caret-bottom')
          $(h5).next().show()
        }
      } else if (e.target.closest('li')) {
        let li = e.target.closest('li')
        let filepath = li.closest('.file-section').getAttribute('data-path')
        if ($(li).hasClass('more-search-result')) {
          gotoLine(filepath)
        } else {
          let row = parseInt($(li).children(0).text())
          gotoLine(filepath, row)
        }
      }
    },
    collapseAll () {
      $('.search-result-lists ul').hide()
      $('.search-result-lists i').removeClass('el-icon-caret-bottom').addClass('el-icon-caret-right')
    },
    expandAll () {
      $('.search-result-lists ul').show()
      $('.search-result-lists i').removeClass('el-icon-caret-right').addClass('el-icon-caret-bottom')
    }
  },
  mounted () {
    this.resetSize()
    signal.receive('appendSearchResult', (rt, reg) => {
      if (rt.EOF) {
        this.stopSearch()
        return
      }
      if (rt.data) {
        addSearchItem(rt.data, reg)
        this.setResult(rt)
      } else {
        this.setResult(rt)
      }
    })
    signal.receive('finishReplace', (rt) => {
      if (rt.EOF) {
        this.stopSearch()
        return
      }
      this.setResult(rt)
    })
    signal.receive('resetSearchResult', () => {
      this.reset()
      $('.search-result-lists').text('')
    })
  }
}
</script>