import React from 'react'
import ReactDOMServer from 'react-dom/server'
import StaticRouter from 'react-router-dom/StaticRouter'
import { matchRoutes, renderRoutes } from 'react-router-config'
import DefaultTemplate from './components/DefaultTemplate'
import findAllDataCalls from './helpers/findAllDataCalls'
import matchRoute from './helpers/matchRoute'

const serverRender = ({ Html = DefaultTemplate, globals = ``, routes, disable, LoadingSpinner }, req, res) => {
  if (disable) {
    const html = ReactDOMServer.renderToString(<Html />)
    return res.send(`<!DOCTYPE html>${html}`)
  }

  const extensionRegex = /(?:\.([^.]+))?$/
  const extension = extensionRegex.exec(req.url)[1]

  if (extension) {
    return res.sendStatus(404)
  }

  const context = {}
  const state = {}
  const component = props => renderRoutes(props.route.routes)
  const cleansedRoutes = [{ component, routes }]
  const matchedRoutes = matchRoutes(cleansedRoutes, req.url)
  const { statusCode = 200 } = matchRoute(matchedRoutes)
  const dataCalls = findAllDataCalls(matchedRoutes, state, req)

  Promise.all(dataCalls)
    .then(data => {
      const fetchedProps = {}
      let loadingSpinner

      data.map(component => {
        const name = component.displayName
        fetchedProps[name] = component.defaultProps
      })

      state._dataFromServerRender = fetchedProps

      const app = ReactDOMServer.renderToString(
        <StaticRouter location={req.url} context={context}>
          {renderRoutes(cleansedRoutes)}
        </StaticRouter>
      )

      const wrapper = ReactDOMServer.renderToString(
        <Html state={state} loadingSpinner={loadingSpinner}>
          {app}
        </Html>
      )

      res.status(statusCode).send(`<!DOCTYPE html>${wrapper}`)
    })
    .catch(err => {
      res.status(400).send(`400: An error has occurred: ${err}`)
    })
}

export default serverRender
