const Q = require('q')
require('regenerator-runtime/runtime.js')

const executeFetchData = async (component, match, req, res) => {
  if (typeof component.fetchData !== 'function') {
    console.info(`fetchData is not a function or not static on ${component.displayName}`)
    return new Error('Fetch data not defined or not a function.')
  }

  const fetch = component.fetchData({ match, req, res, isServerRender: !!req })
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
        updatedKeys.forEach(key => {
          result[component.displayName][key] = response[key]
        })
      } catch (error) {
        console.info(`fetchData failed for ${component.displayName}`, error)
        props.error = true
      }
    } catch (error) {
      console.info(`fetchData failed for ${component.displayName}`, error)
    }

    return result
  }

  try {
    const responses = await Q.allSettled(keys.map(key => fetch[key]))

    responses.forEach((data, index) => {
      if (data.value) {
        result[component.displayName][keys[index]] = data.value
      } else {
        result[component.displayName][keys[index]] = data.reason
        console.info(`fetchData #${index + 1} in ${component.displayName} returned undefined.`)
      }
    })
  } catch (error) {
    console.info(`fetchData failed for ${component.displayName}`, error)
  }

  return result
}

module.exports = executeFetchData
