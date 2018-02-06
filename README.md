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

`react-ssr` is a minimalistic solution to achieve server-side rendering with a few lines of code and a simple ruleset. The simple ruleset is outlined with performance in mind, and must be followed to server side render React apps effectively.

## Installation

```sh
$ npm install react-ssr --save
$ npm install babel-plugin-react-ssr --save-dev
```

Add the babel plugin to your `.babelrc`. This is currently **required**.
```json
{
  "plugins": [
    "react-ssr"
  ]
}
```

## Adding to your server

Firstly, you'll need to use the module on your Node server and have some static routes of your app setup. The below example uses express:

- Your Node JS express server
`server.js`
```js
import express from 'express'
import ssr from 'react-ssr'
import routes from './routes'

const app = express()
const renderer = ssr({ routes })

app.get('*', renderer) // send all routes to ssr
```

- Static routes of your React app
`routes.js`
```js
import HomePage from './HomePage'
import NotFoundPage from './NotFoundPage'

const routes = [
  {
    path: '/',
    exact: true,
    component: HomePage
  },
  {
    path: '/about',
    redirect: '/'
  },
  {
    path: '**',
    component: NotFoundPage
  }
]

export default routes
```

## Fetching data

There's one important rule: If you want to make a data call, and you'd like it to be server side rendered correctly, you'll need to use a special method for this. It's a static method that sits in your React component called `fetchData`. `react-ssr` will execute this before it begins rendering your app on the server and inject the result of it into the components props.

Here's an example:

```js
class Navigation extends React.Component {
  static fetchData () {
    const pageContent = new Promise((resolve, reject) => {
      fetch('/api')
        .then(res => res.json())
        .then(resolve)
        .catch(reject)
    })

    return {
      content: pageContent // becomes available as this.props.content
    }
  }

  render () {
    console.log(this.props.content)
    return <span />
  }
```

🏆 You should now have server-side rendering setup. There's still a few extra things to think about to make this work for more advanced applications. Continue reading to find out more.

## Some caveats and notes

At the moment there are a few caveats you'll need to consider for server side rendering with these static methods. Some of them will have to remain, whereas others will slowly be improved in future releases.

- You can't access `this` inside your static `fetchData`. This means you cannot access `this.props`, so no props-driven data call here. If you want to achieve this, you'll need to chain api calls together in a parent container, wrapped in one promise, then pass the result into the child component as standard props.
- You **can** access `params` inside your static `fetchData`. The params of your React route are available as an argument to the method. `static fetchData (params) {}`
- You _must_ return an object with keys in your static `fetchData`. This API won't be finalised until the first major release.
- You _must_ use static routes of your app currently. You might be able to define them how you want in future releases.
- The static `fetchData` methods will only work on React components that are classes currently. Functional components are not yet supported.
- You have to use Babel so the plugin can work some magic. This might not be required in the future. If it still is, we'll consider adding Typescript transformers and any other alternative requirements.
- Components not directly defined in the `render` method might not server side render yet. This is changing in an immediate minor release to follow - won't be long!
- Components that are dynamically rendered with static `fetchData` will not be server-side rendered. So, if you're programatically doing something like this, it won't server-side render, but instead show a loading spinner and client-side render:
```jsx
const DynamicComponent = components['MyComponent']
return <DynamicComponent />
```

The documentation for this solution is still actively under writing. Further info with accompanying diagrams to visualise the approach to server-side rendering will follow soon.

## Not what you were expecting?

This package has recently changed from a previous solution by akiran. You can find his work here: https://github.com/akiran/react-ssr

## License

[MIT](https://github.com/oayres/react-ssr/blob/master/LICENSE.md)