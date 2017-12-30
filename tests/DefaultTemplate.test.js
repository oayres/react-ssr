import React from 'react'
import { shallow } from 'enzyme'
import DefaultTemplate from '../src/DefaultTemplate'

test('renders without exploding', () => {
  const minProps = {
    state: {
      app: {}
    }
  }

  const wrapper = shallow(<DefaultTemplate {...minProps} />)
  expect(wrapper.length).toBe(1)
})
