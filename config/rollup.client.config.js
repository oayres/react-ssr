import uglify from 'rollup-plugin-uglify'
import babel from 'rollup-plugin-babel'
import resolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'
import includePaths from 'rollup-plugin-includepaths'
import peerDepsExternal from 'rollup-plugin-peer-deps-external'

export default {
  input: 'src/decorators/ssrFetchData.js',
  output: {
    name: 'ssr-fetch-data',
    file: 'lib/fetchData.js',
    format: 'umd'
  },
  plugins: [
    peerDepsExternal(),
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
