const React = require('react')
const withRouter = require('react-router').withRouter
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

    static getDerivedStateFromProps (nextProps, prevState) {
      if (nextProps && !nextProps.disableFetchData) {
        const { params = {} } = prevState

        if (Object.keys(params).length > 0 && params !== nextProps.match.params) {
          return { fetched: false, params }
        }
      }

      return {
        ...nextProps,
        ...prevState
      }
    }

    async fetchData () {
      try {
        const props = await executeFetchData(DecoratedComponent, this.props.match)
        this.clientFetchedProps = props
        this.error = false
        this.setState({ fetched: true })
      } catch (error) {
        console.warn('Failed to fetch some props for fetchData. Rendering anyway...', error)
        this.error = true
        this.setState({ fetched: true })
      }
    }

    extractFromWindow () {
      const { _dataFromServerRender = {} } = window.__STATE || {}
      return _dataFromServerRender[DecoratedComponent.displayName]
    }

    render () {
      if (typeof window === 'undefined') {
        this.loaderRequired = false // on server...
      }

      return (
        <SSRConsumer>
          {(props = {}) => {
            console.info('ssrFetchData props? ', props)
            let componentProps = props[DecoratedComponent.displayName]
            componentProps = componentProps || this.clientFetchedProps || this.extractFromWindow()

            if (!componentProps) {
              this.fetchData()
              this.loaderRequired = true
            }

            const loading = !this.state.fetched && this.loaderRequired && !this.props.disableFetchData
            const error = this.error && !this.props.disableFetchData
            return <DecoratedComponent {...this.props} {...componentProps} loading={loading} error={error} />
          }}
        </SSRConsumer>
      )
    }
  }

  const { ssrWaitsFor, displayName, name, fetchData } = DecoratedComponent

  return hoistNonReactStatics(ssrFetchData, DecoratedComponent, {
    ssrWaitsFor,
    fetchData,
    displayName: displayName || name
  })
}

module.exports = ssrFetchData
