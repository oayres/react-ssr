/**
 * Builds a promise to execute the matched fetchData method
 * @param {*} component - component with fetchData method/promose
 * @param {*} params - params of matched route to pass to fetchData
 */
const executeFetchData = (component, params) => {
  return new Promise(async (resolve, reject) => {
    if (typeof component.fetchData !== 'function') {
      return reject(new Error('Fetch data not defined or not a function.'))
    }

    const fetch = component.fetchData(params)
    const keys = Object.keys(fetch || {}) || []
    const props = {}

    if (!keys.length) {
      try {
        const response = await fetch
        const updatedKeys = Object.keys(response || {})

        updatedKeys.forEach((key, index) => {
          props[key] = response[key]
        })

        component.defaultProps = { ...component.defaultProps, ...props }
        resolve(component)
      } catch (e) {
        reject(e)
      }
    } else {
      Promise.all(Object.values(fetch))
        .then(responses => {
          responses.forEach((data, index) => {
            props[keys[index]] = data
          })

          component.defaultProps = { ...component.defaultProps, ...props }
          resolve(component)
        })
        .catch(reject)
    }
  })
}

/**
 * Builds list of fetchData promise methods for each component
 * @param component - the current React component
 * @param params - contains our state
 * @returns {Array} promises - returns an array of promises, each a fetchData
 */
const fetchData = (component, params, promises = []) => {
  if (component.fetchData) {
    component.defaultProps = component.defaultProps || {}
    promises.push(executeFetchData(component, params))
  }

  if (component._ssrWaitsFor) {
    component._ssrWaitsFor.forEach(childComponent => {
      promises = fetchData(childComponent || childComponent.WrappedComponent, params, promises)
    })
  }

  return promises
}

export default fetchData
