import fetchData from './fetchData'

const findAllDataCalls = (matchedRoutes, url, state = {}) => {
  let promises = matchedRoutes.map(({route}) => {
    const fetchDataForProps = route.component.fetchDataForProps
    const waitsFor = route.component.waitsFor

    if (fetchDataForProps || waitsFor) {
      return fetchData(route.component)
    }
  })

  promises = promises.filter(promise => typeof promise !== 'undefined')
  return [].concat.apply([], promises)
}

export default findAllDataCalls
