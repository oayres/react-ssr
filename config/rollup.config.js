import uglify from 'rollup-plugin-uglify'
import babel from 'rollup-plugin-babel'
import commonjs from 'rollup-plugin-commonjs'
import includePaths from 'rollup-plugin-includepaths'
import fs from 'fs'
import path from 'path'
const pkg = JSON.parse(fs.readFileSync(path.resolve('./package.json'), 'utf-8'))
const external = Object.keys(pkg.peerDependencies || {}).concat(Object.keys(pkg.dependencies || {}))

export default {
  input: 'src/index.js',
  output: {
    name: 'react-ssr',
    file: 'lib/index.js',
    format: 'umd'
  },
  external,
  plugins: [
    includePaths({
      paths: ['./']
    }),
    babel({
      exclude: 'node_modules/**'
    }),
    commonjs({
      include: [
        'src/**/*.js',
        'node_modules/**'
      ]
    })
    // uglify()
  ]
}
