const Q = require('q')
const url = require('url')
const debug = require('debug')
const React = require('react')
const ReactDOMServer = require('react-dom/server')
const StaticRouter = require('react-router-dom/StaticRouter')
const { matchRoutes, renderRoutes } = require('react-router-config')
const DefaultTemplate = require('./components/DefaultTemplate')
const findAllDataCalls = require('./helpers/findAllDataCalls')
const { SSRProvider } = require('./ssrContext')

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
  routes,
  disable,
  ignore = [],
  cache = {
    mode: 'none',
    duration: 1800,
    redisClient: null
  }
}, req, res) => {
  const urlWithoutQuery = req.url.split('?')[0]

  if (disable || ignore.includes(urlWithoutQuery)) {
    const html = ReactDOMServer.renderToString(<Html />)
    return res.send(`<!DOCTYPE html>${html}`)
  }

  const { redisClient } = cache || {}
  const extensionRegex = /(?:\.([^.]+))?$/
  const extension = extensionRegex.exec(urlWithoutQuery)[1]
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
  const lastRoute = matchedRoutes[matchedRoutes.length - 1] || {}
  const parsedUrl = url.parse(req.url) || {}
  const dataCalls = findAllDataCalls(matchedRoutes, {req, res, url: parsedUrl.pathname})
  const statusCode = (lastRoute && lastRoute.route && lastRoute.route.path && lastRoute.route.path.includes('*')) ? 404 : 200

  if (!parsedUrl.pathname) {
    debug('Parsed URL has no patch name.')
  }

  Q.allSettled(dataCalls)
    .then(async fetchedProps => {
      fetchedProps = fetchedProps.map(prop => prop.value).reduce((prop, props) => ({...props, ...prop}))

      let appJsx = () => (
        <StaticRouter location={req.url} context={context}>
          {renderRoutes(cleansedRoutes)}
        </StaticRouter>
      )

      state._dataFromServerRender = fetchedProps

      if (Providers) {
        appJsx = () => (
          <Providers>
            <appJsx />
          </Providers>
        )
      }

      appJsx = () => (
        <SSRProvider value={fetchedProps}>
          <appJsx />
        </SSRProvider>
      )

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

module.exports = serverRender
