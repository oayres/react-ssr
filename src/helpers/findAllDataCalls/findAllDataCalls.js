import fetchData from '../fetchData'

const extractFetchData = (component, {match, req, res, debug}) => {
  const requiresData = component.fetchData
  const ssrWaitsFor = component.ssrWaitsFor

  if (requiresData || ssrWaitsFor) {
    return fetchData(component, match, req, res, debug)
  }
}

const checkRoute = (options, route = {}, routeCalls = []) => {
  if (route.routes) {
    const childCalls = route.routes.map(route => checkRoute(options, route)) || []
    routeCalls = routeCalls.concat(childCalls)
  }

  if (route.component) {
    routeCalls.push(extractFetchData(route.component, options))
  }

  return routeCalls
}

const flatten = arr => Array.isArray(arr) ? [].concat(...arr.map(flatten)) : arr

const findAllDataCalls = (matchedRoute = {}, options) => {
  const promises = checkRoute(options, matchedRoute.route) || []
  const flattenedPromises = flatten(promises).filter(promise => typeof promise !== 'undefined')
  return flattenedPromises
}

export default findAllDataCalls
