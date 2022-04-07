// rollup.config.js
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

export default {
  input: 'dist/client.js',
  output: {
    file: 'static/bundle.js',
    format: 'iife',
    name: 'runhfscweb'
  },
  plugins: [nodeResolve(), commonjs()]
};