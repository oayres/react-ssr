import React from 'react'
import { StaticRouter } from 'react-router-dom'
import ssrFetchData from './ssrFetchData'

class Test extends React.Component {
  static fetchData () {
    // placeholder...
  }

  render () {
    return <span />
  }
}

test('renders without exploding', () => {
  const Component = ssrFetchData(Test)
  const wrapper = shallow(
    <StaticRouter context={{}}>
      <Component match={{}} />
    </StaticRouter>
  )

  expect(wrapper.length).toEqual(1)
})
