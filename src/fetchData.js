/**
 * Execute fetchData methods for each component
 * @param renderProps
 * @param state - contains our state
 * @returns {Promise} - returns a promise
 */
const fetchData = (component, params, promises = []) => {
  if (component.fetchData) {
    component.defaultProps = component.defaultProps || {}

    promises.push(
      new Promise((resolve, reject) => {
        const calls = component.fetchData(params)
        const keys = Object.keys(calls)
        const props = {}

        Promise.all(Object.values(calls))
          .then(responses => {
            responses.forEach((data, index) => {
              props[keys[index]] = data
            })

            component.defaultProps = { ...component.defaultProps, ...props }
            resolve(component)
          })
      })
    )
  }

  if (component._ssrWaitsFor) {
    component._ssrWaitsFor.forEach(childComponent => {
      if (childComponent.type || childComponent.WrappedComponent) {
        promises = fetchData(childComponent.type || childComponent.WrappedComponent, params, promises)
      }
    })
  }

  return promises
}

export default fetchData
