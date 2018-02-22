import uglify from 'rollup-plugin-uglify'
import babel from 'rollup-plugin-babel'
import resolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'
import includePaths from 'rollup-plugin-includepaths'
import peerDepsExternal from 'rollup-plugin-peer-deps-external'

export default {
  input: 'src/index.js',
  output: {
    name: 'react-ssr',
    file: 'lib/index.js',
    format: 'umd'
  },
  external: [
    'react',
    'react-dom',
    'react-helmet',
    'react-router-dom',
    'react-router-config'
  ],
  plugins: [
    // peerDepsExternal(),
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
