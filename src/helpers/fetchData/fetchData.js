/**
 * Execute fetchData methods for each component
 * @param renderProps
 * @param state - contains our state
 * @returns {Promise} - returns a promise
 */
const fetchData = (component, params, promises = []) => {
  console.info('Looping over a component... ', component.displayName || component._displayName || component.name || 'no name')

  if (component.fetchData) {
    component.defaultProps = component.defaultProps || {}

    console.info('Found a fetchData on it.')

    promises.push(
      new Promise(async (resolve, reject) => {
        const fetch = component.fetchData(params)
        const props = {}

        if (Promise.resolve(fetch) === fetch) {
          try {
            console.log('Awaiting a fetch for component', component.name || component.displayName || component._displayName || 'component..')
            const response = await fetch
            const keys = Object.keys(response)
            console.info('Resolved a fetch.')
            keys.forEach((data, index) => {
              props[keys[index]] = data
            })

            component.defaultProps = { ...component.defaultProps, ...props }
            resolve(component)
          } catch (e) {
            reject(e)
          }
        } else {
          const keys = Object.keys(fetch)

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
    )
  }

  if (component._ssrWaitsFor) {
    console.info('Found an _ssrWaitsFor on it.')

    component._ssrWaitsFor.forEach(childComponent => {
      if (childComponent.type || childComponent.WrappedComponent) {
        promises = fetchData(childComponent.type || childComponent.WrappedComponent, params, promises)
      }
    })
  }

  return promises
}

export default fetchData
