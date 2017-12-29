# react-cohere

<p align="center">
  <a href="https://travis-ci.org/oayres/react-cohere">
    <img src="https://api.travis-ci.org/oayres/react-cohere.svg?branch=master"
         alt="build status">
  </a>
  <a href="https://www.npmjs.com/package/react-cohere">
    <img src="https://img.shields.io/npm/v/react-cohere.svg"
         alt="npm version">
  </a>
  <a href="https://github.com/oayres/react-cohere/blob/master/LICENSE.md">
    <img src="https://img.shields.io/npm/l/react-cohere.svg"
         alt="license">
  </a>
  <a href="https://david-dm.org/oayres/react-cohere">
    <img src="https://david-dm.org/oayres/react-cohere/status.svg"
         alt="dependency status">
  </a>
  <a href="https://codecov.io/github/oayres/react-cohere?branch=master">
    <img src="https://codecov.io/gh/oayres/react-cohere/branch/master/graph/badge.svg" alt="Coverage via Codecov" />
  </a>
  <br><br>
  <b>Note that Cohere is not <i>quite</i> ready for production yet. <br> Feel free to use it and open issues. It is actively under development.</b>
</p>

## Overview

Cohere, sometimes referred to as _react-cohere_, is an all-in-one solution to achieve server-side and static rendering of React applications in just a few lines of code. Using its own basic set of principles, Cohere aims to help make your routes _coherent_, meaning each route is a defined entity. Implementing these principles is what makes your app rapid to render, everywhere.

## Installation

```sh
$ npm install react-cohere --save
```

## Usage

Cohere has several different points of concern. Out of the box, it will server side render (SSR) routes of your app, but it may not do so asychronously without following our coherent principles. Basic usage will show you how to enable SSR synchronously. Advanced usage will provide an asynchronous example with API calls on the server.

### Basic usage

The below example shows you a simple express server with an array of static routes that references two pages - both of which are React components returning some simple JSX.

- Your Node JS express server
`server.js`
```js
import express from 'express'
import cohere from 'react-cohere'
import routes from './routes'

const app = express()
const renderer = cohere({ routes })

app.get('*', renderer) // send all routes to Cohere
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

🏆 You should now have server-side rendering setup. There's still a few extra things to think about to make this work for more advanced applications. Continue reading to find out more.

### Advanced usage

So, you've got the app server-side rendering, but you need it to make data calls on the server, huh? We've got you covered. Let's assume you have dynamic data calls (calling an API) that determine the rendering of certain components. For example, you might not be able to render out a table of locations until you have called a Google Maps API and have the JSON available to your app. In these circumstances, Cohere will not server-side render your app out of the box correctly. Cohere provides a fluent api to extend your React components with for handling such scenarios.


