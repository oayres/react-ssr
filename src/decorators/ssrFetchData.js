import 'regenerator-runtime/runtime.js'
import React from 'react'
import { withRouter } from 'react-router'
import LoadingSpinner from '../components/LoadingSpinner/LoadingSpinner'
import { executeFetchData } from '../helpers/fetchData/fetchData'

const ssrFetchData = DecoratedComponent => {
  // const fetchAllData = (params = {}) => {
  //   return new Promise(async (resolve, reject) => {
  //     if (typeof DecoratedComponent.fetchData !== 'function') {
  //       return reject(new Error('Fetch data not defined or not a function.'))
  //     }

  //     const fetch = DecoratedComponent.fetchData(params)
  //     const keys = Object.keys(fetch) || []
  //     const props = {}

  //     if (!keys.length) {
  //       try {
  //         const response = await fetch
  //         const updatedKeys = Object.keys(response)

  //         updatedKeys.forEach((key, index) => {
  //           props[key] = response[key]
  //         })

  //         resolve(props)
  //       } catch (e) {
  //         reject(e)
  //       }
  //     } else {
  //       Promise.all(keys.map(key => fetch[key]))
  //         .then(responses => {
  //           responses.forEach((data, index) => {
  //             props[keys[index]] = data
  //           })

  //           resolve(props)
  //         })
  //         .catch(reject)
  //     }
  //   })
  // }

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

        executeFetchData(DecoratedComponent, this.props.match.params)
          .then(componentWithData => {
            // DecoratedComponent._ssrProps = Object.keys(props)
            DecoratedComponent.defaultProps = componentWithData.defaultProps
            this.setState({ fetched: true })
          })
          .catch(error => {
            console.warn('Failed to fetch some props for fetchData. Rendering anyway...', error)
            this.setState({ fetched: true })
          })
      }
    }

    // checkIfAlreadyInProps () {
    //   if (DecoratedComponent._ssrProps) {
    //     this.recallFetchData = false
    //     this.loaderRequired = false

    //     DecoratedComponent._ssrProps.forEach(key => {
    //       const alreadyHasProp = typeof this.props[key] !== 'undefined'
    //       const notInDefaultProps = !DecoratedComponent.defaultProps || typeof DecoratedComponent.defaultProps[key] === 'undefined'

    //       if (!alreadyHasProp && notInDefaultProps) {
    //         this.recallFetchData = true
    //         this.loaderRequired = true
    //       }
    //     })
    //   } else {
    //     this.recallFetchData = true
    //     this.loaderRequired = true
    //   }
    // }

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
