import path from 'path'
export default {
  props: ['path', 'status', 'active', 'clickItem'],
  name: 'resource-recent-item',
  functional: true,
  render (h, c) {
    let basename = path.win32.basename(c.props.path)
    let dirname = path.dirname(c.props.path).split(path.sep).pop()
    let status = c.props.status ? c.props.status : ''
    return (
      <li title={c.props.path} class={{active: c.props.active}}>
        <span class="close"></span>
        <span class="open-files-name">
          <i>{dirname}</i>&nbsp;
          {basename}
        </span>
        <span class="status">{status}</span>
      </li>
    )
  }
}
