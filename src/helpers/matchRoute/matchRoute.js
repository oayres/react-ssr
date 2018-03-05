const matchRoute = (matchedRoutes = []) => {
  let statusCode = 200

  if (matchedRoutes.length > 1) {
    if (matchedRoutes[1].route.path === '**') {
      statusCode = 404
    }
  }

  return { matchedRoutes, statusCode }
}

export default matchRoute
