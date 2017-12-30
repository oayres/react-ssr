import fetchData from './fetchData'

const findAllDataCalls = (matchedRoutes, url, state = {}) => {
  let promises = matchedRoutes.map(({route}) => {
    const fetchData = route.component.fetchData
    const waitsFor = route.component.waitsFor

    if (fetchData || waitsFor) {
      return fetchData(route.component)
    }
  })

  promises = promises.filter(promise => typeof promise !== 'undefined')
  return [].concat.apply([], promises)
}

export default findAllDataCalls
