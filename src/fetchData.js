import React, { Fragment } from 'react'
import { withRouter } from 'react-router'
const executeFetchData = require('./executeFetchData')
const hoistNonReactStatics = require('hoist-non-react-statics')
const PrerenderContext = require('./context')
require('regenerator-runtime/runtime.js')

const ssrFetchData = DecoratedComponent => {
  @withRouter
  class ssrFetchData extends React.Component {
    componentName = DecoratedComponent.displayName
    loaderRequired = false
    error = false
    clientFetchedData = null
    state = {
      fetched: false,
      params: this.props.match.params
    }

    componentDidMount () {
      window._hydratedData = window._hydratedData || {}
    }

    async fetchData () {
      try {
        const props = await executeFetchData(DecoratedComponent, this.props.match)
        this.clientFetchedData = props[this.componentName]
        window._hydratedData[this.componentName] = props[this.componentName]
        console.info('Just set ', this.componentName, ' this data:', props[this.componentName])
        this.error = false
        this.setState({ fetched: true })
      } catch (error) {
        console.warn('Failed to fetch some props for fetchData. Rendering anyway...', error)
        this.error = true
        this.setState({ fetched: true })
      }
    }

    extractFromWindow () {
      const hydratedData = window._hydratedData || {}
      return hydratedData[this.componentName]
    }

    // storeInWindow () {
    //   return `
    //     window._hydratedData = window._hydratedData || {}
    //     window._hydratedData[${this.componentName}] = ${this.clientFetchedData};
    //   `
    // }

    render () {
      // const isPrerendering = window._prerendering

      return (
        <PrerenderContext.PrerenderConsumer>
          {() => {
            const componentProps = this.clientFetchedData || this.extractFromWindow()

            if (!componentProps) {
              this.fetchData()
              this.loaderRequired = true
            }

            const loading = !this.state.fetched && this.loaderRequired && !this.props.disableFetchData
            const error = this.error && !this.props.disableFetchData
            return (
              <Fragment>
                <DecoratedComponent {...this.props} {...componentProps} loading={loading} error={error} retryFetchData={this.fetchData.bind(this)} />
                {/* {isPrerendering && (
                  <script dangerouslySetInnerHtml={{ __html: this.storeInWindow() }} />
                )} */}
              </Fragment>
            )
          }}
        </PrerenderContext.PrerenderConsumer>
      )
    }
  }

  /** Defines what JSX components we need to fetchData for */
  ssrFetchData.ssrWaitsFor = DecoratedComponent.ssrWaitsFor
  /** Unique name for this component, to use for checking on window state */
  ssrFetchData.displayName = DecoratedComponent.displayName || DecoratedComponent.name
  /** Make the static fetchData method available, pass through, as HOCs lose statics */
  ssrFetchData.fetchData = DecoratedComponent.fetchData

  return hoistNonReactStatics(ssrFetchData, DecoratedComponent)
}

export { PrerenderContext }
export default ssrFetchData
