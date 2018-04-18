import React from 'react'
import ReactDOMServer from 'react-dom/server'
import StaticRouter from 'react-router-dom/StaticRouter'
import { matchRoutes, renderRoutes } from 'react-router-config'
import Q from 'q'
// import { minify } from 'html-minifier'
import DefaultTemplate from './components/DefaultTemplate'
import findAllDataCalls from './helpers/findAllDataCalls'
import matchRoute from './helpers/matchRoute'

const fetchPageFromCache = async (redisClient, key) => {
  let data

  try {
    data = await redisClient.get(key)
  } catch (e) {
    console.warn(`Failed to get cached page for ${key}`)
  }

  return data
}

const storePageInCache = async (redisClient, key, data, cacheExpiry) => {
  try {
    await redisClient.set(key, data, 'ex', cacheExpiry)
  } catch (e) {
    console.warn(`Failed to set cached page for ${key}`)
  }
}

const serverRender = async ({
  Html = DefaultTemplate,
  Providers,
  globals = ``,
  routes,
  disable,
  debug = false,
  cache = {
    mode: 'none',
    duration: 1800,
    redisClient: null
  }
}, req, res) => {
  if (disable) {
    const html = ReactDOMServer.renderToString(<Html />)
    return res.send(`<!DOCTYPE html>${html}`)
  }

  const { redisClient } = cache || {}
  const extensionRegex = /(?:\.([^.]+))?$/
  const extension = extensionRegex.exec(req.url)[1]
  const hasRedis = redisClient && typeof redisClient.exists === 'function' && typeof redisClient.get === 'function'
  const safeToCache = req.useCacheForRequest

  if (extension) {
    return res.sendStatus(404)
  }

  // does req.url include query parameters? do we want to cache routes with query parameters?
  if (safeToCache && hasRedis && cache && cache.mode === 'full') {
    if (await redisClient.exists(req.url)) {
      const cachedPage = await fetchPageFromCache(redisClient, req.url)

      if (cachedPage) {
        return res.status(200).send(cachedPage)
      }
    }
  }

  const context = {}
  const state = {}
  const component = props => renderRoutes(props.route.routes)
  const cleansedRoutes = [{ component, routes }]
  const matchedRoutes = matchRoutes(cleansedRoutes, req.url)
  const { matchedRoute, statusCode = 200 } = matchRoute(matchedRoutes)
  const dataCalls = findAllDataCalls(matchedRoute, {req, debug, match: matchedRoute.match})

  Q.allSettled(dataCalls)
    .then(async data => {
      const fetchedProps = {}
      let appJsx = (
        <StaticRouter location={req.url} context={context}>
          {renderRoutes(cleansedRoutes)}
        </StaticRouter>
      )

      data.map(component => {
        const name = component.value.displayName
        fetchedProps[name] = component.value.defaultProps
      })

      state._dataFromServerRender = fetchedProps

      if (Providers) {
        appJsx = (
          <Providers>
            {appJsx}
          </Providers>
        )
      }

      const app = ReactDOMServer.renderToString(appJsx)
      const wrapper = ReactDOMServer.renderToString(<Html state={state}>{app}</Html>)
      const page = `<!DOCTYPE html>${wrapper}`

      if (safeToCache && hasRedis && cache && cache.mode === 'full') {
        await storePageInCache(redisClient, req.url, page, cache.duration)
      }

      res.status(statusCode).send(page)
    })
    .catch(err => {
      res.status(400).send(`400: An error has occurred: ${err}`)
    })
}

export default serverRender
