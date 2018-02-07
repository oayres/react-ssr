import fetchData from './fetchData'

test('will directly return promises if component does not have _ssrWaitsFor or fetchData', () => {
  const component = {}
  const result = fetchData(component, {}, [])
  expect(Array.isArray(result)).toBeTruthy()
  expect(result).toEqual([])
})
