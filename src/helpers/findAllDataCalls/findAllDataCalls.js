import fetchData from '../fetchData'

const findAllDataCalls = (matchedRoutes = [], state = {}, match = {}, req = {}) => {
  let promises = matchedRoutes.map(({route}) => {
    const requiresData = route.component.fetchData
    const _ssrWaitsFor = route.component._ssrWaitsFor

    if (requiresData || _ssrWaitsFor) {
      return fetchData(route.component, match, req)
    }
  })

  promises = promises.filter(promise => typeof promise !== 'undefined')
  return [].concat.apply([], promises)
}

export default findAllDataCalls
