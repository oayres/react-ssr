import React from 'react'
import StaticRouter from 'react-router-dom/StaticRouter'
import ssrFetchData from './ssrFetchData'

class Test extends React.Component {
  render () {
    return <span />
  }
}

test('renders without exploding', () => {
  const Component = ssrFetchData(Test)
  const wrapper = mount(
    <StaticRouter context={{}}>
      <Component />
    </StaticRouter>
  )

  expect(wrapper.length).toEqual(1)
})
