import fetchData from './fetchData'

const findAllDataCalls = (matchedRoutes, state = {}, params = {}) => {
  let promises = matchedRoutes.map(({route}) => {
    const requiresData = route.component.fetchData
    const waitsFor = route.component.waitsFor

    if (requiresData || waitsFor) {
      return fetchData(route.component, params)
    }
  })

  promises = promises.filter(promise => typeof promise !== 'undefined')
  return [].concat.apply([], promises)
}

export default findAllDataCalls
