import findAllDataCalls from './findAllDataCalls'
import fetchData from '../fetchData'
jest.mock('../fetchData')

test('returns an empty array when you give it nothing', () => {
  const result = findAllDataCalls()
  expect(Array.isArray(result)).toBeTruthy()
  expect(result).toEqual([])
})

test('it does not call fetchData when looping through route without ssrWaitsFor or fetchData static properties', () => {
  const dummyRoute = [{route: {component: {}}}]
  findAllDataCalls(dummyRoute)
  expect(fetchData).toHaveBeenCalledTimes(0)
})
