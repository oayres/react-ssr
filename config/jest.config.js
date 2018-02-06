import React from 'react'
import Enzyme from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'
import Helmet from 'react-helmet'

Enzyme.configure({ adapter: new Adapter() })

global.React = React
global.mount = Enzyme.mount
global.shallow = Enzyme.shallow
global.render = Enzyme.render
Helmet.canUseDOM = false
