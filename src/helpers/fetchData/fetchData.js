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
      new Promise(async (resolve, reject) => {
        const fetch = component.fetchData(params)
        const keys = Object.keys(fetch) || []
        const props = {}

        if (!keys.length) {
          try {
            const response = await fetch
            const updatedKeys = Object.keys(response)

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
    )
  }

  if (component._ssrWaitsFor) {
    component._ssrWaitsFor.forEach(childComponent => {
      console.info('In a child component ', childComponent, childComponent.WrappedComponent)

      promises = fetchData(childComponent || childComponent.WrappedComponent, params, promises)
    })
  }

  return promises
}

export default fetchData
