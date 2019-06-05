import React from 'react'
import { withRouter } from 'react-router'
const executeFetchData = require('../helpers/executeFetchData')
const hoistNonReactStatics = require('hoist-non-react-statics')
const SSRConsumer = require('../ssrContext').SSRConsumer
require('regenerator-runtime/runtime.js')

const ssrFetchData = DecoratedComponent => {
  @withRouter
  class ssrFetchData extends React.Component {
    constructor (props) {
      super(props)
      this.state = { fetched: false, params: props.match.params }
      this.loaderRequired = false
      this.error = false
    }

    // static getDerivedStateFromProps (nextProps, prevState) {
    //   if (nextProps && !nextProps.disableFetchData) {
    //     const { params = {} } = prevState

    //     if (Object.keys(params).length > 0 && params !== nextProps.match.params) {
    //       return { fetched: false, params }
    //     }
    //   }

    //   return {
    //     ...nextProps,
    //     ...prevState
    //   }
    // }

    async fetchData () {
      try {
        const props = await executeFetchData(DecoratedComponent, this.props.match)
        this.clientFetchedProps = props[DecoratedComponent.displayName]
        this.error = false
        this.setState({ fetched: true })
      } catch (error) {
        console.warn('Failed to fetch some props for fetchData. Rendering anyway...', error)
        this.error = true
        this.setState({ fetched: true })
      }
    }

    extractFromWindow () {
      if (typeof window !== 'undefined') {
        const { _dataFromServerRender = {} } = window.__STATE || {}
        return _dataFromServerRender[DecoratedComponent.displayName]
      }

      return null
    }

    render () {
      if (typeof window === 'undefined') {
        this.loaderRequired = false // on server...
      }

      return (
        <SSRConsumer>
          {(props = {}) => {
            const componentProps = props[DecoratedComponent.displayName] || this.clientFetchedProps || this.extractFromWindow()

            if (!componentProps && !this.loaderRequired) {
              this.fetchData()
              this.loaderRequired = true
            }

            const loading = !this.state.fetched && this.loaderRequired && !this.props.disableFetchData
            const error = this.error && !this.props.disableFetchData
            return <DecoratedComponent {...this.props} {...componentProps} loading={loading} error={error} retryFetchData={this.fetchData.bind(this)} />
          }}
        </SSRConsumer>
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

export default ssrFetchData
