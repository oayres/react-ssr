import React from 'react'
import { withRouter } from 'react-router'
import LoadingSpinner from './components/LoadingSpinner/LoadingSpinner'
// import DefaultLoadingSpinner from './components/LoadingSpinner'

const cohere = DecoratedComponent => {
  const fetchAllData = (params = {}) => {
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

  class _decoratedForServerRender extends React.Component {
    componentWillMount () {
      if (!this.state || typeof this.state.fetched !== 'undefined') {
        this.recallFetchData = false
        this.loaderRequired = false
        this.setState({ fetched: false })
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

    shouldComponentUpdate (nextProps, nextState) {
      return nextState.fetched
    }

    fetchData () {
      if (this.recallFetchData) {
        this.loaderRequired = true

        fetchAllData(this.props.match.params)
          .then(props => {
            DecoratedComponent.defaultProps = {...DecoratedComponent.defaultProps, ...props}
            this.setState({ fetched: true })
          })
          .catch(error => {
            console.warn('Failed to fetch some props for fetchData. Rendering anyway...', error)
            this.setState({ fetched: true })
          })
      }
    }

    checkIfAlreadyAssignedToDefaultProps () {
      if (DecoratedComponent._ssrProps) {
        DecoratedComponent._ssrProps.forEach(key => {
          if (!DecoratedComponent.defaultProps || typeof DecoratedComponent.defaultProps[key] === 'undefined') {
            this.recallFetchData = true
            this.loaderRequired = true
          }
        })
      }
    }

    extractFromWindow () {
      if (typeof window !== 'undefined') {
        const { _dataFromServerRender = {} } = window.__STATE
        const props = _dataFromServerRender[DecoratedComponent.name]

        if (props) {
          DecoratedComponent.defaultProps = {...DecoratedComponent.defaultProps, ...props}
          this.recallFetchData = false
          this.loaderRequired = false
        }
      }
    }

    render () {
      // const LoadingSpinner = this.props.loadingSpinner || DefaultLoadingSpinner

      if (!this.state.fetched && typeof window !== 'undefined') {
        /**
         * Stage 1: See if it's in the window state...
         */
        this.extractFromWindow()

        /**
         * Stage 2: See if data is now, or previously was, in defaultProps
         */
        this.checkIfAlreadyAssignedToDefaultProps()

        /**
         * Stage 3: Call to fetch the data as not found...
         */
        this.fetchData()
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

  // may not be needed...
  _decoratedForServerRender._ssrWaitsFor = DecoratedComponent._ssrWaitsFor
  _decoratedForServerRender._ssrProps = DecoratedComponent._ssrProps
  _decoratedForServerRender.fetchData = DecoratedComponent.fetchData
  // end of may not be needed

  _decoratedForServerRender._displayName = DecoratedComponent.name
  return withRouter(_decoratedForServerRender)
}

export default cohere
