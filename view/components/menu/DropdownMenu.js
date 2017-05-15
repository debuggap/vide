/*
* -----------------------------------------------
* @params : lists
* menu列表通过render来渲染
* 通过emit callback在父组件进行调用
* -----------------------------------------------
*/
import 'assets/css/menu/dropdown-menu.scss'

import platforms from 'engine/platforms'
import {changeHotkeyIcon} from 'engine/shortcut'
import focusBlur from 'engine/focus_blur'
import DropdownSubMenu from './DropdownSubMenu'
import $ from 'jquery'
import ace from 'ace'
import store from 'store'

let platform = platforms.platform
if (platform !== 'mac') {
  platform = 'win'
}

// 获取快捷键的描述
function getHotkey (func) {
  if (!func) {
    return ''
  }
  let hotkeys = store.state.config.hotkeys
  let hotkey = null
  hotkeys.some(function (item) {
    if (item.func === func) {
      hotkey = item
      return true
    }
  })
  if (!hotkey) {
    return ''
  }
  hotkey = hotkey['bindKey'][platform]
  return changeHotkeyIcon(hotkey)
}

// 普通列表item
function generateItem (list, createElement) {
  return [
    createElement('a', {
      domProps: {
        href: 'javascript:void(0)'
      }
    }, [
      list.name,
      createElement('span', {'class': 'hotkey-desc'}, getHotkey(list.func))
    ])
  ]
}

// show system list
function generateSystemHotkey (list, createElement) {
  return [
    createElement('a', {
      domProps: {
        href: 'javascript:void(0)'
      }
    }, [
      list.name,
      createElement('span', {'class': 'hotkey-desc'}, changeHotkeyIcon(list.bindKey[platform]))
    ])
  ]
}

// 显示sub-menu
function generateSubMenu (list, createElement, i) {
  if (list.sub && list.sub.length) {
    return [
      createElement('a', {
        domProps: {
          href: 'javascript:void(0)'
        }
      }, [
        list.name,
        createElement('span', {'class': 'arrow'})
      ]),
      createElement(DropdownSubMenu, {
        props: {
          lists: list.sub,
          index: i
        }
      })
    ]
  } else {
    return [
      createElement('a', {
        domProps: {
          href: 'javascript:void(0)'
        }
      }, [
        list.name
      ])
    ]
  }
}

// click event for menu
function clickEventForMenu (list, context) {
  let func = list.func
  let editor = ace.edit('editor')
  if (func) {
    if (editor.commands.commands[func]) {
      // here func is bound in the ace default commends
      editor.execCommand(func)
    } else {
      // call parent event
      context.$emit('menuItemClick', list)
    }
  }
  // hidden menu
  context.$emit('menuClose')
}

export default {
  name: 'dropdown-menu',
  props: ['lists'],
  updated () {
    focusBlur.register('.dropdown-menu', () => {
      this.$emit('menuClose')
      return true
    })
  },
  created () {
    focusBlur.register('.dropdown-menu', () => {
      this.$emit('menuClose')
      return true
    })
  },
  destroyed () {
    focusBlur.unregister('.dropdown-menu')
  },
  render (createElement) {
    let items = []
    let item
    let lists = this.lists ? this.lists : []
    let len = lists.length
    for (let i = 0, list; i < len; i++) {
      list = lists[i]
      if (list === '|') {
        item = createElement('li', {'class': 'divider'})
      } else if (list.sub) {
        // if menu has sub menu
        item = createElement('li', {
          'class': {
            'sub-menu': true,
            'disable': !list.sub.length
          },
          'attrs': {
            'data-index': i
          },
          'on': {
            // use mouseover and mouseout to toggle submenu
            'mouseover': this.mouseoverSubMenu,
            'mouseout': this.mouseoutSubMenu
          }
        }, generateSubMenu(list, createElement, i))
      } else if (list.bindKey) {
        // system default hotkey
        item = createElement('li', {
          'class': {
            'disable': list.disable
          },
          'attrs': {
            'data-index': i
          }
        }, generateSystemHotkey(list, createElement))
      } else {
        // common item
        item = createElement('li', {
          'class': {
            'disable': list.disable
          },
          'attrs': {
            'data-index': i
          }
        }, generateItem(list, createElement))
      }
      items.push(item)
    }
    return createElement('ul', {
      'class': 'dropdown-menu',
      'on': {
        'click': (event) => {
          let node = event.target
          let index, list
          while (node.tagName !== 'LI') {
            node = node.parentNode
          }
          index = node.getAttribute('data-index')
          if (!index) {
            // when we click divider,it should return
            return
          }
          index = index.split('.')
          list = this.lists[index[0]]
          if (index[1]) {
            list = list.sub[index[1]]
          }
          clickEventForMenu(list, this)
        }
      }
    }, items)
  },
  methods: {
    mouseoverSubMenu (event) {
      $(event.currentTarget).addClass('open')
    },
    mouseoutSubMenu (event) {
      $(event.currentTarget).removeClass('open')
    }
  }
}
