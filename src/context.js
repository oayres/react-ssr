const React = require('react')

const { Provider, Consumer } = React.createContext()

module.exports = {
  PrerenderProvider: Provider,
  PrerenderConsumer: Consumer
}
