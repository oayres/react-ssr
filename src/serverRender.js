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
  const matchesFromReactRouter = matchRoutes(cleansedRoutes, req.url)
  const { matchedRoutes, statusCode } = matchRoute(matchesFromReactRouter)
  const { route = {}, match = {} } = matchedRoutes.length > 1 ? matchedRoutes[1] : matchedRoutes[0]

  if (route.redirect) {
    return res.redirect(route.redirect)
  }

  const dataCalls = findAllDataCalls(matchedRoutes, state, match, req)

  Promise.all(dataCalls)
    .then(data => {
      const fetchedProps = {}

      data.map(component => {
        const name = component.displayName
        fetchedProps[name] = component.defaultProps
      })

      state._dataFromServerRender = fetchedProps

      if (LoadingSpinner) {
        state.loadingSpinner = LoadingSpinner
      }

      const app = ReactDOMServer.renderToString(
        <Html state={state}>
          <StaticRouter location={req.url} context={context}>
            {renderRoutes(cleansedRoutes)}
          </StaticRouter>
        </Html>
      )

      res.status(statusCode).send(`<!DOCTYPE html>${app}`)
    })
    .catch(err => {
      res.status(400).send(`400: An error has occurred: ${err}`)
    })
}

export default serverRender
