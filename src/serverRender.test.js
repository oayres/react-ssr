const serverRender = require('./serverRender')
// const debug = require('debug')
jest.mock('debug')

test('calls res to send basic html immediately back if disable is enabled', () => {
  const res = { send: jest.fn() }
  const options = {
    disable: true,
    Html: 'div'
  }

  serverRender(options, {url: ''}, res)

  expect(res.send).toHaveBeenCalled()
  expect(res.send).toHaveBeenCalledWith(`<!DOCTYPE html><div data-reactroot=""></div>`)
})

test('calls res to send basic html immediately back if url is in ignore array', () => {
  const res = { send: jest.fn() }
  const options = {
    Html: 'div',
    ignore: ['/test']
  }

  serverRender(options, {url: '/test'}, res)

  expect(res.send).toHaveBeenCalled()
  expect(res.send).toHaveBeenCalledWith(`<!DOCTYPE html><div data-reactroot=""></div>`)
})

test('calls res to send basic html immediately back if url is stripped of query and is in ignore array', () => {
  const res = { send: jest.fn() }
  const options = {
    Html: 'div',
    ignore: ['/test']
  }

  serverRender(options, {url: '/test?exampleQuery=true'}, res)

  expect(res.send).toHaveBeenCalled()
  expect(res.send).toHaveBeenCalledWith(`<!DOCTYPE html><div data-reactroot=""></div>`)
})

test('it calls res.sendStatus with 404 status code when given path with extension', () => {
  const res = { sendStatus: jest.fn() }
  const options = {
    Html: 'div'
  }

  serverRender(options, {url: '/test.js'}, res)

  expect(res.sendStatus).toHaveBeenCalled()
  expect(res.sendStatus).toHaveBeenCalledWith(404)
})

// test('it calls debug when there is no matched pathname in url', () => {
//   const res = { sendStatus: jest.fn() }
//   const options = {
//     Html: 'div'
//   }

//   serverRender(options, {url: 'www.vodafone.co.uk'}, res)

//   expect(debug).toHaveBeenCalled()
//   expect(debug).toHaveBeenCalledWith('Parsed URL has no path name.')
// })
