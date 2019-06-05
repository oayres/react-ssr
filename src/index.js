import serverRender from './serverRender'
require('regenerator-runtime/runtime.js')
export default (config = {}) => serverRender.bind(null, config)
