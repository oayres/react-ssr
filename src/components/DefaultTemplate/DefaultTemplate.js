import React from 'react'

class Html extends React.Component {
  render () {
    const state = this.props.state
    const injectedState = `window.__STATE = ${JSON.stringify(state)};`
    let { title, meta, link, bodyAttrs, htmlAttrs } = this.props.document

    try {
      const Helmet = require('react-helmet')
      const helmet = Helmet.renderStatic()
      title = title || helmet.title.toComponent()
      meta = meta || helmet.meta.toComponent()
      link = link || helmet.link.toComponent()
      htmlAttrs = htmlAttrs || helmet.htmlAttributes.toComponent()
      bodyAttrs = bodyAttrs || helmet.bodyAttributes.toComponent()
    } catch (e) {
      // Helmet wasn't given to us...
      // for now, we'll silently skip
    }

    return (
      <html lang='en-gb' {...htmlAttrs}>
        <head>
          {title}
          {meta}
          {link}
          <meta charSet='utf-8' />
          <meta httpEquiv='X-UA-Compatible' content='IE=edge' />
          <meta name='viewport' content='width=device-width, initial-scale=1' />
          <meta name='mobile-web-app-capable' content='yes' />
          <link href='/assets/styles.css' rel='stylesheet' />
          <link rel='icon' type='image/x-icon' href='/favicon.ico' />

          <script dangerouslySetInnerHTML={{__html: this.props.globals}} />
        </head>
        <body {...bodyAttrs}>
          <div id='root'>{this.props.children}</div>
          <script dangerouslySetInnerHTML={{__html: injectedState}} />
          <script src='/assets/bundle.js' />
        </body>
      </html>
    )
  }
}

Html.defaultProps = {
  document: {}
}

export default Html
