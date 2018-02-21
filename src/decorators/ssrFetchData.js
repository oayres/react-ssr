import 'regenerator-runtime/runtime.js'
import React from 'react'
import { withRouter } from 'react-router'
import LoadingSpinner from '../components/LoadingSpinner/LoadingSpinner'
import { executeFetchData } from '../helpers/fetchData/fetchData'

const ssrFetchData = DecoratedComponent => {
  @withRouter
  class _decoratedForServerRender extends React.Component {
    constructor (props) {
      super(props)
      this.state = {
        fetched: false
      }

      this.recallFetchData = false
      this.loaderRequired = false
    }

    componentWillReceiveProps (nextProps) {
      if (nextProps) {
        const { params = {} } = this.props.match

        if (Object.keys(params).length > 0 && params !== nextProps.params) {
          this.setState({ fetched: false })
        }
      }
    }

    fetchData () {
      if (this.recallFetchData) {
        this.loaderRequired = true
        const req = {} // fake version of Node's req, as passed as argument

        executeFetchData(DecoratedComponent, this.props.match, req)
          .then(componentWithData => {
            DecoratedComponent.defaultProps = componentWithData.defaultProps
            this.setState({ fetched: true })
          })
          .catch(error => {
            console.warn('Failed to fetch some props for fetchData. Rendering anyway...', error)
            this.setState({ fetched: true })
          })
      }
    }

    extractFromWindow () {
      if (typeof window !== 'undefined') {
        const { _dataFromServerRender = {} } = window.__STATE || {}
        const props = _dataFromServerRender[DecoratedComponent.displayName]

        if (props) {
          DecoratedComponent.defaultProps = {...DecoratedComponent.defaultProps, ...props}
        } else {
          this.recallFetchData = true
          this.loaderRequired = true
        }
      }
    }

    render () {
      // const LoadingSpinner = this.props.loadingSpinner || DefaultLoadingSpinner

      if (!this.state.fetched && typeof window !== 'undefined') {
        this.extractFromWindow()

        if (this.recallFetchData && !this.props.disableFetchData) {
          this.fetchData()
        }
      } else if (typeof window === 'undefined') {
        this.loaderRequired = false // on server...
      }

      const showLoader = !this.props.disableLoadingSpinner && !this.state.fetched && this.loaderRequired

      return (
        <span>
          {showLoader && <LoadingSpinner />}
          <DecoratedComponent {...this.props} />
        </span>
      )
    }
  }

  /** Defines what JSX components we need to fetchData for */
  _decoratedForServerRender._ssrWaitsFor = DecoratedComponent._ssrWaitsFor
  /** Unique name for this component, to use for checking on window state */
  _decoratedForServerRender.displayName = DecoratedComponent.displayName
  /** Make the static fetchData method available, pass through, as HOCs lose statics */
  _decoratedForServerRender.fetchData = DecoratedComponent.fetchData

  return _decoratedForServerRender
}

export default ssrFetchData
