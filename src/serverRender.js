import React from 'react'
import ReactDOMServer from 'react-dom/server'
import StaticRouter from 'react-router-dom/StaticRouter'
import { renderRoutes } from 'react-router-config'
import DefaultTemplate from './DefaultTemplate'
import findAllDataCalls from './findAllDataCalls'
import matchRoute from './matchRoute'
const docType = `<!DOCTYPE html>`

const serverRender = ({ Html = DefaultTemplate, globals = ``, routes, redisClient }, req, res) => {
  const context = {}
  const state = {
    app: {
      title: 'Test',
      description: 'example desc'
    }
  }

  const component = props => renderRoutes(props.route.routes)
  const cleansedRoutes = [{ component, routes }]
  const { matchedRoutes, statusCode } = matchRoute(cleansedRoutes, req.url)
  const { redirect, renderStatic, path } = matchedRoutes.length > 1 ? matchedRoutes[1].route : matchedRoutes[0].route

  if (redirect) {
    return res.redirect(redirect)
  }

  if (renderStatic && redisClient) {
    redisClient.exists(`cohere-${path}`)
      .then(exists => {
        if (exists) {
          return redisClient.get(`cohere-${path}`)
        } else {
          ssr()
        }
      })
      .then(content => {
        console.info(content)
        res.status(200).send(`${docType}${content}`)
      })
      .catch(error => {
        console.warn('Error: ', error)
        ssr()
      })
  }

  const ssr = () => {
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
  
        if (renderStatic && redisClient) {
          redisClient.set(`cohere-${path}`, content)
        }
  
        res.status(statusCode).send(`${docType}${content}`)
      })
      .catch(err => {
        res.status(400).send(`400: An error has occurred: ${err}`)
      })
  }
}

export default serverRender
