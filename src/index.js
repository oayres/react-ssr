import serverRender from './serverRender'

const cohere = (config = {}) => serverRender.bind(null, config)

export default cohere
