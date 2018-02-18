import fetchData from '../fetchData'

const findAllDataCalls = (matchedRoutes = [], state = {}, params = {}) => {
  let promises = matchedRoutes.map(({route}) => {
    const requiresData = route.component.fetchData
    const _ssrWaitsFor = route.component._ssrWaitsFor

    console.info('Mapping route.. ', requiresData, _ssrWaitsFor)

    if (requiresData || _ssrWaitsFor) {
      return fetchData(route.component, params)
    }
  })

  promises = promises.filter(promise => typeof promise !== 'undefined')
  return [].concat.apply([], promises)
}

export default findAllDataCalls
