import fetchData from '../fetchData'

const findAllDataCalls = (matchedRoutes = [], state = {}, match = {}, req = {}, debug) => {
  let promises = matchedRoutes.map(({route}) => {
    const requiresData = route.component.fetchData
    const ssrWaitsFor = route.component.ssrWaitsFor

    if (requiresData || ssrWaitsFor) {
      return fetchData(route.component, match, req, debug)
    }
  })

  promises = promises.filter(promise => typeof promise !== 'undefined')
  return [].concat.apply([], promises)
}

export default findAllDataCalls
