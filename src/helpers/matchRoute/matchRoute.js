const matchRoute = (matchedRoutes = []) => {
  let statusCode = 200
  let matchedRoute = matchedRoutes[0]

  if (matchedRoutes.length > 1) {
    if (matchedRoutes[1].route.path === '**') {
      statusCode = 404
    }

    matchedRoute = matchedRoutes[1]
  }

  return { matchedRoute, statusCode }
}

export default matchRoute
