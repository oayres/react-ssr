import React from 'react'
import { withRouter } from 'react-router'
import DefaultLoadingSpinner from './LoadingSpinner'

const cohere = DecoratedComponent => {
  const fetchData = (params = {}) => {
    return new Promise((resolve, reject) => {
      const calls = DecoratedComponent.fetchData(params)
      const keys = Object.keys(calls)
      const props = {}

      Promise.all(Object.values(calls))
        .then(responses => {
          responses.forEach((data, index) => {
            props[keys[index]] = data
          })

          resolve(props)
        })
        .catch(error => {
          reject(error)
        })
    })
  }

  return withRouter(class _decoratedForServerRender extends DecoratedComponent {
    static _displayName = DecoratedComponent.name

    constructor (props) {
      super(props)
      this.state = {
        fetched: false
      }
    }

    componentWillReceiveProps () {
      /**
       * Check if route has params
       * If params have changed, this.recallFetchData = true
       * Params need to be passed into fetchData
       */
    }

    render () {
      const LoadingSpinner = this.props.loadingSpinner || DefaultLoadingSpinner
      let recallFetchData = false

      if (!this.state.fetched && typeof window !== 'undefined') {
        /**
         * Stage 1: See if it's in the window state...
         */
        if (typeof window !== 'undefined') {
          const { _dataFromServerRender = {} } = window.__STATE
          const props = _dataFromServerRender[DecoratedComponent.name]

          if (props) {
            // this.props = {...this.props, ...props}
            DecoratedComponent.defaultProps = {...DecoratedComponent.defaultProps, ...props}
            recallFetchData = false
          }
        }

        /**
         * Stage 2: See if data is now, or previously was, in defaultProps
         */
        if (DecoratedComponent.propsForServerRender) {
          DecoratedComponent.propsForServerRender.forEach(key => {
            if (!DecoratedComponent.defaultProps || typeof DecoratedComponent.defaultProps[key] === 'undefined') {
              recallFetchData = true
            }
          })
        }

        /**
         * Stage 3: Call to fetch the data as not found...
         */
        if (recallFetchData) {
          fetchData(this.props.match.params)
            .then(props => {
              DecoratedComponent.defaultProps = {...DecoratedComponent.defaultProps, ...props}
              this.setState({ fetched: true })
            })
            .catch(error => {
              console.warn('Failed to fetch some props for fetchData. Rendering anyway...', error)
              this.setState({ fetched: true })
            })

          if (this.props.disableLoadingSpinner) {
            return null
          }

          return <LoadingSpinner />
        }
      }

      return <DecoratedComponent {...this.props} />
    }
  })
}

export default cohere
