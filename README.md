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

## Overview

`react-ssr` achieves server-side rendering with a few lines of code and one simple rule. The rule is outlined with performance in mind, and must be followed to server side render React apps efficiently. It supports React Router 4, which introduced challenges to server-side rendering by making you have to declare data calls at a route level. `react-ssr` allows you to make those calls at a component level.

## Installation

```sh
$ npm install react-ssr --save
```

We've just moved onto a major alpha incase you're interested. Just install `react-ssr@next` instead to opt for that.

We recommend you use the babel plugin too. Add the babel plugin to your `.babelrc`.
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

## Getting started

Hopefully you can get a simple page server-rendering in minutes. Efficiently. Here's everything you need to know.

### Setting up the server

Assuming you have a simple express server setup, you'll just need to hand off your routes to react-ssr. Bear in mind you can also pass a custom template that will be responsible for the 'HTML document' that wraps your React app, too. Copy the example from [src/components/DefaultTemplate](https://github.com/oayres/react-ssr/blob/master/src/components/DefaultTemplate/DefaultTemplate.js) as a starting point.

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

### Setting up the routes

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

### Fetching data

There's one important rule: If you want to make a data call, and you'd like it to be server side rendered correctly, you'll need a static `fetchData` method. `react-ssr` will execute this before it begins rendering your app on the server and inject the result of it into the components props.

Here's an example (note to use inline static syntax, you need another babel plugin, you can just do `Navigation.fetchData` otherwise):
```js
const getNavItems = () => {
  return new Promise((resolve, reject) => {
    fetch('/api/navigation')
      .then(res => res.json())
      .then(resolve)
      .catch(reject)
  })
})

class Navigation extends React.Component {
  static fetchData ({req, match}) {
    return {
      content: getNavItems() // becomes available as this.props.content
    }
  }

  render () {
    console.log(this.props.content)
    return <span />
  }
}

// alternative syntax...
Navigation.fetchData = ({req, match}) => {
  return {
    content: getNavItems() // becomes available as this.props.content
  }
}
```

🏆 You should now have server-side rendering setup. **Keep reading if you haven't used the babel plugin.**

### Example repos

Check out the exmaple playground repository. It includes a basic Webpack setup with recommended babel plugins. More examples to follow, please raise an issue if you'd like something more urgently.

See https://github.com/oayres/react-ssr-examples

### No babel plugin?

Raise an issue if you'd like an alternative to the babel plugin. Without it, here's the two things you'll need to do:

- Any component with a static fetchData must be wrapped at the bottom with our higher order component:
```jsx
import ssrFetchData from 'react-ssr/fetchData'

class MyComponent extends React.Component {
  static fetchData () {}
}

export default ssrFetchData(MyComponent)
```

- Your route/page/top-level components should have an ssrWaitsFor static array containing components required for fetchData calls, e.g:
```jsx
import Example from './Example'
import OtherChildWithStaticFetchData from './OtherChildWithStaticFetchData'

class MyPage extends React.Component {
  render () {
    return (
      <Example />
    )
  }
}

MyPage.ssrWaitsFor = [
  Example,
  OtherChildWithStaticFetchData
]

export default MyPage
```

And your done.

## Notes

There's a few things to consider here. Since data fetching occurs before rendering begins, you'll have these points to deal with:

- You can't access `this` inside your static `fetchData`. Chain API calls together in parent components if they are dependent.
- You must use static routes. Dynamic routing (using `<Route />`) takes place as your app is rendering, but this has huge performance implications for server side rendering. So, we must have a static set of routes that we can match against before rendering begins. For some reading, see the [data loading with server side rendering in React Router v4](https://reacttraining.com/react-router/web/guides/server-rendering).
- Components that are dynamically rendered with static `fetchData` will not be server-side rendered. So, if you're programatically doing something like the below, it will render with `this.props.loading` as true on the client, then fetch the data:
```jsx
const DynamicComponent = components['MyComponent']
return <DynamicComponent />
```

## Caveat

This is an edge case, but I'd rather put it here for you now incase it helps. Your React components _must_ export default a variable (and it should ideally have a unique name - so it can safely stash its data without clashing with other components), which could be the class, or the class wrapped in higher order components if you don't use decorators, here's some scenarios:

```jsx
@myDecorator
class MyComponentName extends Component {}
export default MyComponentName // works
```

```jsx
import { observer } from 'mobx-react'
class MyComponent extends Component {}

const variableWithUniqueName = observer(MyComponent)
export default variableWithUniqueName // also works
```

```jsx
import { observer } from 'mobx-react'
class MyComponent extends Component {}
export default observer(MyComponent) // currently would not work - do the above instead
```

## Options

| Option        | Description                                  | Required | Default                                    |
| ------------- | -------------------------------------------- | -------- | ------------------------------------------ |
| routes        | static routes array of your react app        | yes      | []                                         |
| disable       | disables server-side rendering               | no       | false                                      |
| debug         | adds more verbose logging to requests        | no       | false                                      |
| Html          | override core html document template         | no       | see src/components/DefaultTemplate in repo |

## Contributing

This package is still early doors. Please do get involved, feel free to critique it, offer solutions that can change its approach slightly, or request examples on how you want to use it. Spotted a bug, need something adding? Raise an issue. Pull requests welcome. 👌

## License

[MIT](https://github.com/oayres/react-ssr/blob/master/LICENSE.md)
