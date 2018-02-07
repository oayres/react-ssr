import LoadingSpinner from './LoadingSpinner'

test('LoadingSpinner renders without exploding', () => {
  const wrapper = shallow(<LoadingSpinner />)
  expect(wrapper.length).toEqual(1)
  expect(snapshot(wrapper)).toMatchSnapshot()
})
