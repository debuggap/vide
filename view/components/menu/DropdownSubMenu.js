/*
* -----------------------------------------------
* menu列表通过render来渲染
* 通过emit函数在父组件进行调用
* -----------------------------------------------
*/
export default {
  name: 'dropdown-submenu',
  functional: true,
  props: ['lists', 'index'],
  render (createElement, context) {
    let items = []
    let lists = context.props.lists
    for (let i = 0; i < lists.length; i++) {
      if (lists[i] === '|') {
        items.push(createElement('li', {'class': 'divider'}))
      } else {
        items.push(createElement('li', {
          'attrs': {
            'data-index': context.props.index + '.' + i
          }
        }, [
          createElement('a', {
            domProps: {
              href: 'javascript:void(0)'
            }
          }, lists[i].name)
        ]))
      }
    }
    return createElement('ul', { 'class': 'dropdown-submenu' }, items)
  }
}
