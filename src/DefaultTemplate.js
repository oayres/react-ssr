import React from 'react'
import Helmet from 'react-helmet'

class Html extends React.Component {
  render () {
    const helmet = Helmet.renderStatic()
    const htmlAttrs = helmet.htmlAttributes.toComponent()
    const bodyAttrs = helmet.bodyAttributes.toComponent()
    const state = this.props.state
    const injectedState = `window.__STATE = ${JSON.stringify(state)};`

    return (
      <html lang='en-gb' {...htmlAttrs}>
        <head>
          {helmet.title.toComponent()}
          {helmet.meta.toComponent()}
          {helmet.link.toComponent()}
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

export default Html
