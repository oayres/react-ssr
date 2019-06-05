const executeFetchData = require('../executeFetchData')

const fetchData = (component, match, req, res, promises = []) => {
  if (component.fetchData) {
    promises.push(executeFetchData(component, match, req, res))
  }

  if (component.ssrWaitsFor) {
    component.ssrWaitsFor.forEach(childComponent => {
      promises = fetchData(childComponent || childComponent.WrappedComponent, match, req, res, promises)
    })
  }

  return promises
}

module.exports = fetchData
