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

`react-ssr` is a minimalistic solution to achieve server-side rendering with a few lines of code and a simple rule. The simple rule is outlined with performance in mind, and must be followed to server side render React apps effectively. It supports React Router 4, which introduced challenges to server-side rendering by making you have to declare data calls at a route level. `react-ssr` allows you to make those calls at a component level.

## Installation

```sh
$ npm install react-ssr --save
```

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

Check out the exmaple playground repository. It includes a basic Webpack setup with recommended babel plugins. More examples to follow, please raise an issue if you'd like something more urgently.

See https://github.com/oayres/react-ssr-examples

## Fetching data

There's one important rule: If you want to make a data call, and you'd like it to be server side rendered correctly, you'll need a static `fetchData` method. `react-ssr` will execute this before it begins rendering your app on the server and inject the result of it into the components props.

Here's an example (note to use inline static syntax, you need another babel plugin, you can just do `Navigation.fetchData` otherwise):
```js
const pageContent = () => new Promise((resolve, reject) => {
  fetch('/api')
    .then(res => res.json())
    .then(resolve)
    .catch(reject)
})

class Navigation extends React.Component {
  static fetchData ({req, match}) {
    return {
      content: pageContent() // becomes available as this.props.content
    }
  }

  render () {
    console.log(this.props.content)
    return <span />
  }
```

🏆 You should now have server-side rendering setup. **Keep reading if you haven't used the babel plugin.**

## Without babel plugin

Raise an issue if you'd like an alternative to the babel plugin. Anyway, without it, here's what you'll need to do:

- Any component with a static fetchData must be wrapped at the bottom with our higher order component:
```jsx
import ssrFetchData from 'react-ssr/lib/fetchData'

class MyComponent extends React.Component {
  static fetchData () {}
}

export default ssrFetchData(MyComponent)
```

- Your route/page/top-level components should have a waitsFor static array containing components required for fetchData calls, e.g:
```jsx
class MyPage extends React.Component {
  render () {
    return (
      <Example />
    )
  }
}

MyPage._ssrWaitsFor = [
  Example,
  SomeOtherChildWithStaticFetchData
]

export default MyPage
```

And your done.

## Notes

There's a few things to consider here. Since data fetching occurs before rendering begins, you'll have these points to deal with:

- You can't access `this` inside your static `fetchData`. Chain API calls together in parent components if they are dependent.
- You must use static routes. Dynamic routing (react router v4) takes place as your app is rendering, but this has huge performance implications for server side rendering. So, we must have a static set of routes that we can match against before rendering begins.
- Components that are dynamically rendered with static `fetchData` will not be server-side rendered. So, if you're programatically doing something like this, it won't server-side render, but instead show a loading spinner and client-side render:
```jsx
const DynamicComponent = components['MyComponent']
return <DynamicComponent />
```

Also, here's a known caveat with this package you'll need to consider for now:

- Your React components _must_ be an export default, higher order components should be wrapped with decorators, rather than inline around the class name:
```jsx
@myDecorator
class MyComponentName extends Component {}

export default MyComponentName
```
There is a way to avoid the above if you absolutely must. There are rare cases where you can't use the decorator, or you might just not be in a position to use them for some reason. Import the HOC manually and define it like below, ensuring you use a unique variable name for the wrapped instance (even if you use the babel plugin, it will see this and skip it):
```jsx
import fetchData from 'react-ssr/lib/fetchData'
import { observer } from 'mobx-react'

class MyComponent extends Component {}

const variableWithUniqueName = observer(MyComponent)
export default fetchData(variableWithUniqueName)
```

## Options

| Option        | Description                                  | Required | Default                                    |
| ------------- | -------------------------------------------- | -------- | ------------------------------------------ |
| routes        | static routes array of your react app        | yes      | []                                         |
| disable       | disables server-side rendering               | no       | false                                      |
| Html          | override core html document template         | no       | see src/components/DefaultTemplate in repo |

## Contributing

This package is still early doors. Please do get involved, feel free to critique it, offer solutions that can change its approach slightly, or request examples on how you want to use it. Is your thing missing on the below to do? Raise an issue. Pull requests welcome. 👌

To-do:
[ ] Test with nested (child) static routes
[ ] Allow overriding the default loading spinner
[ ] Disable loading spinner prop
[X] Add a this.props.loading prop to fetchData components
[X] Disable fetchData prop (client-side only)
[ ] Improve the export default caveat
[ ] Sample usage repo with MobX
[ ] Sample usage repo with Redux

## License

[MIT](https://github.com/oayres/react-ssr/blob/master/LICENSE.md)
