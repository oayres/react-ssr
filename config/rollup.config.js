import uglify from 'rollup-plugin-uglify'
import babel from 'rollup-plugin-babel'
import resolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'
import includePaths from 'rollup-plugin-includepaths'

export default {
  input: 'src/index.js',
  output: {
    name: 'react-cohere',
    file: 'lib/index.js',
    format: 'umd'
  },
  plugins: [
    includePaths({
      paths: ['./']
    }),
    babel({
      exclude: 'node_modules/**'
    }),
    resolve({
      jsnext: true,
      main: true,
      preferBuiltins: false,
      browser: true
    }),
    commonjs(),
    uglify()
  ]
}
