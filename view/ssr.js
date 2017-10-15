import app from './main'
import fs from 'fs'
const renderer = window.require('vue-server-renderer').createRenderer()
renderer.renderToString(app, function (err, html) {
  if (err) {
    console.log(err)
  } else {
    replaceContent(html)
  }
})

function replaceContent (con) {
  con = con.replace(/\n/g, '')
  con = '<div id="app">' + con + '</div>'
  // replace index.html
  let filepath = process.cwd() + '/ide/index.html'
  fs.readFile(filepath, function (error, html) {
    if (error) {
      alert('error')
    } else {
      html = html.toString()
      html = html.replace(/<!-- ssr start -->.+?<!-- ssr end -->/, '<!-- ssr start -->' + con + '<!-- ssr end -->')
      fs.writeFile(filepath, html)
    }
  })
  // replace template.html
  let filepath1 = process.cwd() + '/ide/template.html'
  fs.readFile(filepath1, function (error, html) {
    if (error) {
      alert('error')
    } else {
      html = html.toString()
      html = html.replace(/<!-- ssr start -->.+?<!-- ssr end -->/, '<!-- ssr start -->' + con + '<!-- ssr end -->')
      fs.writeFile(filepath1, html)
    }
  })
}
