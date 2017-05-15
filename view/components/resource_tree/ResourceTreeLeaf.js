export default {
  props: ['tpath', 'node'],
  name: 'resource-tree-leaf',
  render (h) {
    let currentFile = this.$store.state.editor.currentFile
    let node = this.node
    let className = 'resource-tree-node-leaf'
    if (currentFile === node.path) {
      className += ' active'
    }
    let deep = this.tpath.split('.').length
    let spaceComps = <span class="resource-tree-space" style={{width: (deep * 16) + 'px'}}></span>
    // spaceComps.fill(<span class="resource-tree-space"></span>)
    return (
      <li class="resource-tree-node" key={node.path}>
        <div class={className} unselectable="on" tpath={this.tpath}>
          {spaceComps}
          <a href="javascript:void(0);" hidefocus>
            <span>{node.text}</span>
          </a>
        </div>
      </li>
    )
  }
}
