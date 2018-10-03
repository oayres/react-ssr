const fetchData = require('../fetchData')

const extractFetchData = (component, { match, req, res }) => {
  const requiresData = component.fetchData
  const ssrWaitsFor = component.ssrWaitsFor

  if (requiresData || ssrWaitsFor) {
    return fetchData(component, match, req, res)
  }
}

const checkRoute = (options, route = {}, routeCalls = [], components = []) => {
  if (route.routes) {
    const childCalls = route.routes.map(route => {
      if (route && route.path && route.path.includes(options.url)) {
        const result = checkRoute(options, route, routeCalls, components) || []
        components.concat(result.components)
        return result.routeCalls || []
      }
    })

    routeCalls = routeCalls.concat(childCalls)
  }

  if (route.component) {
    routeCalls.push(extractFetchData(route.component, options))
  }

  return {
    routeCalls,
    components
  }
}

const flatten = arr => Array.isArray(arr) ? [].concat(...arr.map(flatten)) : arr

const findAllDataCalls = (matchedRoutes = [], options = {}) => {
  let promises = []

  matchedRoutes.forEach(matchedRoute => {
    const { routeCalls = [] } = checkRoute({...options, match: matchedRoute.match}, matchedRoute.route)
    promises = promises.concat(routeCalls)
  })

  const flattenedPromises = flatten(promises).filter(promise => typeof promise !== 'undefined')
  return flattenedPromises
}

module.exports = findAllDataCalls
