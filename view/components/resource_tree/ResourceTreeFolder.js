import ResourceTreeLeaf from './ResourceTreeLeaf'
export default {
  props: ['node', 'tpath'],
  name: 'resource-tree-folder',
  render (h) {
    let node = this.node
    let deep = this.tpath.split('.').length - 1
    // 空格组件
    let spaceComps = null
    if (deep) {
      spaceComps = <span class="resource-tree-space" style={{width: (deep * 16) + 'px'}}></span>
    }
    // 子目录
    let childComps = []
    childComps = node.childNodes.map((item, index) => {
      let tpath = this.tpath + '.' + index
      if (item.hasChildren) {
        return <resource-tree-folder tpath={tpath} node={item} key={index}></resource-tree-folder>
      } else {
        return <resource-tree-leaf tpath={tpath} node={item} key={index}></resource-tree-leaf>
      }
    })
    // 子组件是否显示
    let ulShow = { display: node.isexpand ? 'table' : 'none' }
    return (
      <li class="resource-tree-node" key={node.path}>
        <div class="resource-tree-node-folder" unselectable="on" tpath={this.tpath}>
          {spaceComps}
          <span class={{'resource-tree-folder-status': true, 'resource-tree-folder-status-expand': node.isexpand}}></span>
          <a href="javascript:void(0);" hidefocus>
            <span>{node.text}</span>
          </a>
        </div>
        <ul style={ulShow}>
          {childComps}
        </ul>
      </li>
    )
  },
  components: {
    ResourceTreeLeaf
  }
}
