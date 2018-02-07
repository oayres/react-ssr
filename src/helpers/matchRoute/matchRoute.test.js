import matchRoute from './matchRoute'

test('it does not explode when provided routes is undefined from react router', () => {
  const result = matchRoute()
  expect(typeof result).toBe('object')
})

test('returns a 200 status by default as route matched', () => {
  const result = matchRoute()
  expect(result.statusCode).toBe(200)
})

test('matchedRoutes in response is of type array by default', () => {
  const result = matchRoute()
  expect(Array.isArray(result.matchedRoutes)).toBeTruthy()
})
