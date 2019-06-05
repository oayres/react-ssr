const DefaultTemplate = require('./DefaultTemplate')

test('DefaultTemplate renders without exploding', () => {
  const wrapper = shallow(<DefaultTemplate />)
  expect(wrapper.length).toEqual(1)
  expect(snapshot(wrapper)).toMatchSnapshot()
})
