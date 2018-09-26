import fetchData from './fetchData'

const fakeCall = (fakeThingToResolve) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve(fakeThingToResolve)
    }, 10)
  })
}

test('will directly return promises if component does not have ssrWaitsFor or fetchData', () => {
  const component = {}
  const result = fetchData(component, {}, [])
  expect(Array.isArray(result)).toBeTruthy()
  expect(result).toEqual([])
})

test('will add a new promise in if the component has a fetchData', () => {
  const component = { fetchData: jest.fn() }
  const result = fetchData(component, {}, [])
  expect(result.length).toEqual(1)
})

test('it populates the promises array with 2 promises if there is one in ssrWaitsFor', () => {
  const component = {
    fetchData: jest.fn(),
    ssrWaitsFor: [{
      fetchData: jest.fn()
    }]
  }

  const result = fetchData(component, {}, [])

  expect(result.length).toEqual(2)
})

test('it rejects with the expected error when fetchData is not a function', async () => {
  const component = { fetchData: 'invalid-thing' }
  const result = fetchData(component, {}, [])
  await expect(result[0]).resolves.toEqual(
    new Error('Fetch data not defined or not a function.')
  )
})

test('it resolves with the expected props from a single fetchData', async () => {
  const data = { test: 'Game of Thrones!' }
  const component = {
    fetchData: function () {
      return fakeCall(data)
    },
    displayName: 'ExampleOne'
  }

  const result = fetchData(component, {}, [])
  await expect(result[0]).resolves.toEqual({ ExampleOne: data })
})

test('it resolves multiple keys when returning an object of several promises', async () => {
  const data = { one: 'Game of Thrones!', two: 'Westworld' }
  const component = {
    fetchData: function () {
      return {
        one: fakeCall(data.one),
        two: fakeCall(data.two)
      }
    },
    displayName: 'ExampleTwo'
  }

  const result = fetchData(component, {}, [])
  await expect(result[0]).resolves.toEqual({ ExampleTwo: data })
})
