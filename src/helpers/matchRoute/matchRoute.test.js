import matchRoute from './matchRoute'

test('it does not explode when provided routes is undefined from react router', () => {
  const result = matchRoute()
  expect(typeof result).toBe('object')
})

test('returns a 200 status by default as route matched', () => {
  const result = matchRoute()
  expect(result.statusCode).toBe(200)
})

test('matchedRoute in response is of type object by default', () => {
  const result = matchRoute()
  expect(typeof result.matchedRoute).toBe('object')
})

test('sets the status code to 404 when the path is **', () => {
  const dummyRoute = [{}, {route: {path: '**'}}]
  const result = matchRoute(dummyRoute)
  expect(result.statusCode).toBe(404)
})
