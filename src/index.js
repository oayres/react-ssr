require('regenerator-runtime/runtime.js')
const serverRender = require('./serverRender')
module.exports = (config = {}) => serverRender.bind(null, config)
