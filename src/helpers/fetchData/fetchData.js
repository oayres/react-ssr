import Q from 'q'
import 'regenerator-runtime/runtime.js' // for async await, only used here

/**
 * Builds a promise to execute the matched fetchData method
 * @param {*} component - component with fetchData method/promise
 * @param {*} params - params of matched route to pass to fetchData
 */
const executeFetchData = async (component, match, req, res, debug) => {
  if (typeof component.fetchData !== 'function') {
    return new Error('Fetch data not defined or not a function.')
  }

  const fetch = component.fetchData({match, req, res})
  const keys = Object.keys(fetch || {}) || []
  const props = {}
  const result = {}
  result[component.displayName] = {}

  if (!keys.length) {
    try {
      let response

      try {
        response = await fetch
        const updatedKeys = Object.keys(response || {})
        updatedKeys.forEach((key, index) => {
          result[component.displayName][key] = response[key]
        })
      } catch (e) {
        console.warn('Fetch failed for', component.displayName)
        props.error = true
      }
    } catch (error) {
      if (debug) {
        console.warn('Rejected in an array from fetchData. Component: ', component.displayName)
        console.warn('Error: ', error)
      }
    }

    return result
  }

  try {
    const responses = await Q.allSettled(keys.map(key => fetch[key]))

    responses.forEach((data, index) => {
      result[component.displayName][keys[index]] = data.value

      if (!data.value) {
        debug && console.warn(`Fetch #${index + 1} in ${component.displayName} returned undefined.`)
      }
    })
  } catch (error) {
    if (debug) {
      console.warn('Rejected in an array from fetchData. Component: ', component.displayName)
      console.warn('Error: ', error)
    }
  }

  return result
}

/**
 * Builds list of fetchData promise methods for each component
 * @param component - the current React component
 * @param params - contains our state
 * @returns {Array} promises - returns an array of promises, each a fetchData
 */
const fetchData = (component, match, req, res, debug = false, promises = []) => {
  if (component.fetchData) {
    promises.push(executeFetchData(component, match, req, res, debug))
  }

  if (component.ssrWaitsFor) {
    component.ssrWaitsFor.forEach(childComponent => {
      promises = fetchData(childComponent || childComponent.WrappedComponent, match, req, res, debug, promises)
    })
  }

  return promises
}

export { executeFetchData }
export default fetchData
