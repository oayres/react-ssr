import 'regenerator-runtime/runtime.js'
import serverRender from './serverRender'
import ssrFetchData from './decorators/ssrFetchData'
import React from 'react'
import md5 from 'md5'

const hashes = []

// const isClass = func => typeof func === 'function' && /^class\s/.test(Function.prototype.toString.call(func))

const stashHashIfFetchData = Component => {
  if (Component.fetchData) {
    const hash = md5(Component.toString())

    if (!hashes.includes(hash)) {
      hashes.push(hash)
    }
  }
}

const renderComponent = (comp, components = []) => {
  const {Component, props} = comp
  let rendered
  stashHashIfFetchData(Component)

  /**
   * This might not work because it isn't capturing children
   */
  try {
    const instance = new Component({...Component.defaultProps, ...props})
    rendered = instance.render()
  } catch (e) {
    console.warn('Failed on instance: ', e)

    try {
      rendered = Component({...Component.defaultProps, ...props})
    } catch (e) {
      console.warn('Still failed.')
    }
  }

  let ReactComponents = []

  console.info('Rendered for ', Component.displayName, rendered.props.children)

  if (typeof rendered.type === 'function') {
    ReactComponents.push({Component: rendered.type, props: rendered.props})
  }

  if (rendered.props && rendered.props.children) {
    const { children } = rendered.props

    if (Array.isArray(children)) {
      const reactComponentChildren = children.filter(n => n && typeof n.type === 'function' && n.type.prototype.isReactComponent)
      const componentsInProps = reactComponentChildren.map(child => ({Component: child.type, props: child.props}))
      ReactComponents.concat(componentsInProps.map(renderComponent))
    } else if (typeof children.type === 'function' && children.type.prototype.isReactComponent) {
      ReactComponents.push({Component: children.type, props: {...children.props, ...children.routes}})
    }
  }

  components.concat(ReactComponents)
  return components
}

export default (config = {}) => {
  if (!config.routes) {
    throw new Error('You must pass routes to react-ssr.')
  }

  config.routes = config.routes.map(route => {
    if (route.component.prototype.isReactComponent) {
      const waitsFor = renderComponent({Component: route.component, props: route.props})
      console.info('Waits for? ', waitsFor)
      console.info('Hashes? ', hashes)
    }

    if (route.routes) {
      console.info('About to do it for child routes.')
    }

    return route
  })

  return serverRender.bind(null, config)
}
