import serverRender from './serverRender'

test('calls res to send basic html immediately back if disable is enabled', () => {
  const res = { send: jest.fn() }
  const options = {
    disable: true,
    Html: 'div'
  }

  serverRender(options, {}, res)

  expect(res.send).toHaveBeenCalled()
  expect(res.send).toHaveBeenCalledWith(`<!DOCTYPE html><div data-reactroot=""></div>`)
})
