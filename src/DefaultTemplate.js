import React from 'react'

class Html extends React.Component {
  render () {
    const state = this.props.state
    const injectedState = `window.__STATE = ${JSON.stringify(state)};`
    const metadata = {
      title: state.app.title,
      description: state.app.description,
      keywords: state.app.keywords
    }

    return (
      <html lang='en-gb'>
        <head>
          <title>{metadata.title}</title>
          <meta charSet='utf-8' />
          <meta httpEquiv='X-UA-Compatible' content='IE=edge' />
          <meta name='viewport' content='width=device-width, initial-scale=1' />
          <meta name='description' content={metadata.description} />
          <meta name='keywords' content={metadata.keywords} />
          <meta name='mobile-web-app-capable' content='yes' />
          <link href='/assets/styles.css' rel='stylesheet' />
          <link rel='icon' type='image/x-icon' href='/favicon.ico' />

          <script dangerouslySetInnerHTML={{__html: this.props.globals}} />
        </head>
        <body>
          <div id='root'>{this.props.children}</div>
          <script dangerouslySetInnerHTML={{__html: injectedState}} />
          <script src='/assets/bundle.js' />
        </body>
      </html>
    )
  }
}

export default Html
