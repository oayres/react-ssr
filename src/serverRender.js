import React from 'react'
import ReactDOMServer from 'react-dom/server'
import StaticRouter from 'react-router-dom/StaticRouter'
import { renderRoutes } from 'react-router-config'
import DefaultTemplate from './DefaultTemplate'
import findAllDataCalls from './findAllDataCalls'
import matchRoute from './matchRoute'

const serverRender = ({ Html = DefaultTemplate, globals = ``, routes }, req, res) => {
  const context = {}
  const state = {
    app: {
      title: 'Test',
      description: 'example desc'
    }
  }

  const component = props => renderRoutes(props.route.routes)
  const cleansedRoutes = [{ component, routes }]
  const { matchedRoutes, statusCode, redirect } = matchRoute(cleansedRoutes, req.url)

  if (redirect) {
    return res.redirect(redirect)
  }

  const dataCalls = findAllDataCalls(matchedRoutes, state)

  Promise.all(dataCalls)
    .then(data => {
      const content = ReactDOMServer.renderToStaticMarkup(
        <Html state={state}>
          <StaticRouter location={req.url} context={context}>
            {renderRoutes(cleansedRoutes)}
          </StaticRouter>
        </Html>
      )

      res.status(statusCode).send(`<!DOCTYPE html>\n ${content}`)
    })
    .catch(err => {
      res.status(400).send(`400: An error has occurred: ${err}`)
    })
}

export default serverRender
