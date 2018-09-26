const React = require('react')

const { Provider, Consumer } = React.createContext()

module.exports = {
  SSRProvider: Provider,
  SSRConsumer: Consumer
}
