const matchRoute = (matchedRoutes = []) => {
  let statusCode = 200
  let redirect

  if (matchedRoutes.length > 1) {
    if (matchedRoutes[1].route.redirect) {
      redirect = matchedRoutes[1].route.redirect
    }

    if (matchedRoutes[1].route.path === '**') {
      statusCode = 404
    }
  }

  return { matchedRoutes, statusCode, redirect }
}

export default matchRoute
