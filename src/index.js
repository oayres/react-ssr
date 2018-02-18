import 'regenerator-runtime/runtime.js'
import serverRender from './serverRender'
export default (config = {}) => serverRender.bind(null, config)
