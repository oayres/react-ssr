import 'regenerator-runtime/runtime.js'
import React from 'react'
import { withRouter } from 'react-router'
import LoadingSpinner from '../components/LoadingSpinner/LoadingSpinner'

const ssrFetchData = DecoratedComponent => {
  const fetchAllData = (params = {}) => {
    return new Promise(async (resolve, reject) => {
      const fetch = DecoratedComponent.fetchData(params)
      const props = {}

      try {
        const response = await fetch()
        const keys = Object.keys(response)
        keys.forEach((data, index) => {
          props[keys[index]] = data
        })

        resolve(props)
      } catch (e) {
        reject(e)
      }

      // if (Promise.resolve(fetch) === fetch) {
      //   const keys = Object.keys(fetch)

      //   Promise.all(Object.values(fetch))
      //     .then(responses => {
      //       responses.forEach((data, index) => {
      //         props[keys[index]] = data
      //       })

      //       resolve(props)
      //     })
      //     .catch(reject)
      // } else {
      //   fetch()
      //     .then(response => {
      //       console.info(response)
      //       const keys = Object.keys(response)
      //       keys.forEach((data, index) => {
      //         props[keys[index]] = data
      //       })

      //       resolve(props)
      //     })
      //     .catch(reject)
      // }
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

    checkIfAlreadyInProps () {
      if (DecoratedComponent._ssrProps) {
        DecoratedComponent._ssrProps.forEach(key => {
          const alreadyHasProp = typeof this.props[key] !== 'undefined'
          const notInDefaultProps = !DecoratedComponent.defaultProps || typeof DecoratedComponent.defaultProps[key] === 'undefined'

          if (!alreadyHasProp && notInDefaultProps) {
            this.recallFetchData = true
            this.loaderRequired = true
          }
        })
      }
    }

    extractFromWindow () {
      if (typeof window !== 'undefined') {
        const { _dataFromServerRender = {} } = window.__STATE || {}
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
         * Stage 2: See if data is now, or previously was, in props or defaultProps
         */
        this.checkIfAlreadyInProps()

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

export default ssrFetchData
