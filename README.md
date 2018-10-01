# react-ssr

<a href="https://travis-ci.org/oayres/react-ssr">
  <img src="https://api.travis-ci.org/oayres/react-ssr.svg?branch=master" alt="build status">
</a>
<a href="https://www.npmjs.com/package/react-ssr">
  <img src="https://img.shields.io/npm/v/react-ssr.svg" alt="npm version">
</a>
<a href="https://github.com/oayres/react-ssr/blob/master/LICENSE.md">
  <img src="https://img.shields.io/npm/l/react-ssr.svg" alt="license">
</a>
<a href="https://david-dm.org/oayres/react-ssr">
  <img src="https://david-dm.org/oayres/react-ssr/status.svg" alt="dependency status">
</a>
<a href="https://codecov.io/github/oayres/react-ssr?branch=master">
  <img src="https://codecov.io/gh/oayres/react-ssr/branch/master/graph/badge.svg" alt="Coverage via Codecov" />
</a>
<a href="https://standardjs.com">
  <img src="https://img.shields.io/badge/code_style-standard-brightgreen.svg" alt="JavaScript Style Guide" />
</a>
<br>

## 🔍 Overview

`react-ssr` is a simple and lightweight React server-side rendering solution that abstracts the complexities of server-side rendering React applications away from the codebase. `react-ssr` adds another optional 'lifecycle' method to your components for fetching data.

## ⏳ Installation

```sh
$ npm install react-ssr --save
```

We recommend you use [the babel plugin](https://github.com/oayres/babel-plugin-react-ssr#readme) too. Add the babel plugin to your `.babelrc`.
```sh
$ npm install babel-plugin-react-ssr --save-dev
```
```json
{
  "plugins": [
    "react-ssr"
  ]
}
```

You'll also need React 16.3 or higher and React Router 4. They're peerDependencies, obvs.

## 👋 Getting started

Hopefully you can get a simple page server-rendering in minutes. Efficiently. Here's everything you need to know.

**Learn quicker by example?** [Check the sample app out](https://github.com/oayres/react-ssr-sample).

### 1. Setting up the server

Assuming you have a simple express server setup, you'll just need to hand off your routes to react-ssr. Note that you can also pass a custom template that will be responsible for the 'HTML document' that wraps your React app. Copy the example from [src/components/DefaultTemplate](https://github.com/oayres/react-ssr/blob/master/src/components/DefaultTemplate/DefaultTemplate.js) as a starting point.

```js
import express from 'express'
import ssr from 'react-ssr'
import routes from './routes'

const app = express()
const renderer = ssr({
  routes: routes
})

app.get('/*', renderer)
app.listen(8000)
```

### 2. Setting up the routes

You will need an array of static routes, which means each route will be an object (as per React Router v4's docs) and not a `<Route />`. This is because a `<Route />` can only be read once rendering begins. A static route can be matched against before rendering begins.

```js
import HomePage from './pages/HomePage'
import NotFoundPage from './pages/NotFoundPage'

const routes = [
  {
    path: '/',
    exact: true,
    component: HomePage
  },
  {
    path: '**',
    component: NotFoundPage
  }
]
```

Check out [data loading with server side rendering in React Router v4](https://reacttraining.com/react-router/web/guides/server-rendering) to see other comments or examples.

Additionally, your React app entry point will need to *hydrate* those routes out, for example: -
```js
import React from 'react'
import ReactDOM from 'react-dom'
import BrowserRouter from 'react-router-dom/BrowserRouter'
import { renderRoutes } from 'react-router-config'
import routes from './routes'

const App = () => (
  <BrowserRouter>
    {renderRoutes(routes)}
  </BrowserRouter>
)

ReactDOM.hydrate(<App />, document.getElementById('root'))
```

### 3. Fetching data

There's one important rule: If you want to make a data call, and you'd like it to be server side rendered correctly, you'll need a static `fetchData` method. `react-ssr` will execute this before it begins rendering your app on the server and inject the result of it into the components props.

_Heads up! We're using the static keyword below. You'll need to add [the transform class properties babel plugin](https://babeljs.io/docs/plugins/transform-class-properties/) or another alternative to use this at the time of writing._

Here's an example:
```js
class Navigation extends React.Component {
  static fetchData ({req, res, match}) {
    if (req && req.thing) {
      res.redirect() // you can redirect the request
    }

    return {
      content: axios.get('/api/navigation') // becomes available as this.props.content
    }
  }

  render () {
    if (this.props.loading) {
      // react-ssr is calling fetchData client-side
      return <p>loading...</p>
    }

    if (this.props.error) {
      // react-ssr encountered an error calling your fetchData
      return <p>Fancy retry fetch UI...</p>
    }

    console.log(this.props.content)
    return <span />
  }
}

// alternative syntax...
Navigation.fetchData = ({req, res, match}) => {
  return {
    content: axios.get('/api/navigation') // becomes available as this.props.content
  }
}

// only one data call? you can spread out the result into props...
Navigation.fetchData = ({req, res, match}) => {
  return axios.get('/api/navigation') // becomes available as this.props[x], where x is every key returned in top of json tree response from this api call
}
```

🏆 You should now have server-side rendering setup with asynchronous data calls.

## ⌨️ Options

There's two things to know in this section: arguments to `fetchData` and options for `react-ssr`.

### Arguments to fetchData

```js
static fetchData ({req, res, match, isServerRender}) {}
```

| Argument        | Description                                                 |
| --------------- | ----------------------------------------------------------- |
| req             | Node JS request object, server side only                    |
| res             | Node JS response object, server side only                   |
| match           | React route that was matched, contains params               |
| isServerRender  | Shorthand boolean to know if executed from client or server |

### Configuration for react-ssr

```js
import ssr from 'react-ssr'
const renderer = ssr({
  routes: [],
  disable: false,
  ignore: [
    '/example/route' // sends route without ssr if matched
  ],
  cache: { // currently experimental - only accepts redis as a store
    mode: 'full|none', // full means entire page is cached
    duration: 1800, // cache duration in seconds, will rerender and set it again after this time for a given route
    redisClient: null // optional redisClient - ioredis or node_redis - to use redis as store
  }
})
```

| Option        | Description                                           | Required | Default                                    |
| ------------- | ----------------------------------------------------- | -------- | ------------------------------------------ |
| routes        | static routes array of your react app                 | yes      | []                                         |
| disable       | disables server-side rendering                        | no       | false                                      |
| ignore        | array of route paths to skip SSR, just send document  | no       | false                                      |
| Html          | override core html document template                  | no       | see src/components/DefaultTemplate in repo |
| Providers     | wraps your routes, useful for context providers, etc  | no       |                                            |
| cache         | allows caching of components or pages                 | no       | { mode: 'none', duration: 1800 }           |

## Example

Check out the example playground repository. It includes a basic Webpack setup with recommended babel plugins. More examples to follow, please raise an issue if you'd like something more urgently.

See https://github.com/oayres/react-ssr-sample

## 📰 Notes

As data fetching occurs before rendering begins, you should consider:

- You can't access `this` inside your static `fetchData`.
  - If you have some API call that needs data from another call, chain them together one after the other using a Promise or async await.
- Components that are dynamically rendered with static `fetchData` will not be server-side rendered. So, if you're programatically doing something like the below, it will render with `this.props.loading` as true on the client, then fetch the data and rerender:
```jsx
const DynamicComponent = components['MyComponent']
return <DynamicComponent />
```

### No babel plugin?

Two simple steps should be taken if you're giving that a skip, but we recommend you use it to abstract this nonsense away from your codebase. If you'd like an alternative, raise an issue or a PR :-)

[Find out the steps you need to take without the babel plugin here](#).

## 💡 Contributing

This package is still early doors. Please do get involved, feel free to critique it, offer solutions that can change its approach slightly, or request examples on how you want to use it. Spotted a bug, need something adding? Raise an issue. Pull requests welcome. 👌

## 🔑 License

[MIT](https://github.com/oayres/react-ssr/blob/master/LICENSE.md)
