import React from 'react'
import { withRouter } from 'react-router'
import { executeFetchData } from '../helpers/fetchData/fetchData'
import hoistNonReactStatics from 'hoist-non-react-statics'

const ssrFetchData = DecoratedComponent => {
  @withRouter
  class ssrFetchData extends React.Component {
    constructor (props) {
      super(props)
      this.state = { fetched: false, params: props.match.params }
      this.recallFetchData = false
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

    fetchData () {
      if (this.recallFetchData) {
        this.loaderRequired = true

        executeFetchData(DecoratedComponent, this.props.match)
          .then(componentWithData => {
            DecoratedComponent.defaultProps = componentWithData.defaultProps
            this.error = false
            this.setState({ fetched: true })
          })
          .catch(error => {
            console.warn('Failed to fetch some props for fetchData. Rendering anyway...', error)
            this.error = true
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
      if (!this.state.fetched && typeof window !== 'undefined') {
        this.extractFromWindow()

        if (this.recallFetchData && !this.props.disableFetchData) {
          this.fetchData()
        }
      } else if (typeof window === 'undefined') {
        this.loaderRequired = false // on server...
      }

      const loading = !this.state.fetched && this.loaderRequired && !this.props.disableFetchData
      const error = this.error && !this.props.disableFetchData
      return <DecoratedComponent {...this.props} loading={loading} error={error} />
    }
  }

  return hoistNonReactStatics(ssrFetchData, DecoratedComponent)
}

export default ssrFetchData
