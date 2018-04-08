import React from 'react'
import ReactDOMServer from 'react-dom/server'
import StaticRouter from 'react-router-dom/StaticRouter'
import { matchRoutes, renderRoutes } from 'react-router-config'
import Q from 'q'
import DefaultTemplate from './components/DefaultTemplate'
import findAllDataCalls from './helpers/findAllDataCalls'
import matchRoute from './helpers/matchRoute'

const serverRender = ({ Html = DefaultTemplate, globals = ``, routes, disable, debug = false }, req, res) => {
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
  const { matchedRoute, statusCode = 200 } = matchRoute(matchedRoutes)
  const dataCalls = findAllDataCalls(matchedRoute, {req, debug, match: matchedRoute.match})

  Q.allSettled(dataCalls)
    .then(data => {
      const fetchedProps = {}

      data.map(component => {
        const name = component.value.displayName
        fetchedProps[name] = component.value.defaultProps
      })

      state._dataFromServerRender = fetchedProps

      const app = ReactDOMServer.renderToString(
        <StaticRouter location={req.url} context={context}>
          {renderRoutes(cleansedRoutes)}
        </StaticRouter>
      )

      const wrapper = ReactDOMServer.renderToString(
        <Html state={state}>
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
