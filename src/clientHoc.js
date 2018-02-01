import React from 'react'
import { withRouter } from 'react-router'
// import DefaultLoadingSpinner from './components/LoadingSpinner'

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

  class _decoratedForServerRender extends DecoratedComponent {
    constructor (props) {
      super(props)
      this.recallFetchData = false
      this.state = {
        fetched: false
      }
    }

    componentWillReceiveProps (nextProps) {
      if (nextProps) {
        const { params = {} } = this.props.match

        if (Object.keys(params).length > 0 && params !== nextProps.params) {
          this.setState({ fetched: false })
        }
      }
    }

    render () {
      // const LoadingSpinner = this.props.loadingSpinner || DefaultLoadingSpinner

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
            this.recallFetchData = false
          }
        }

        /**
         * Stage 2: See if data is now, or previously was, in defaultProps
         */
        if (DecoratedComponent.propsForServerRender) {
          DecoratedComponent.propsForServerRender.forEach(key => {
            if (!DecoratedComponent.defaultProps || typeof DecoratedComponent.defaultProps[key] === 'undefined') {
              this.recallFetchData = true
            }
          })
        }

        /**
         * Stage 3: Call to fetch the data as not found...
         */
        if (this.recallFetchData) {
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

          return <span>Loading...</span>
          // return <LoadingSpinner />
        }
      }

      return <DecoratedComponent {...this.props} />
    }
  }

  _decoratedForServerRender._displayName = DecoratedComponent.name
  return withRouter(_decoratedForServerRender)
}

export default cohere
