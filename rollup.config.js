import typescript from '@rollup/plugin-typescript';
import dts from 'rollup-plugin-dts';
import { terser } from 'rollup-plugin-terser';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import cleanup from 'rollup-plugin-cleanup';
import analyze from 'rollup-plugin-analyzer';
import license from 'rollup-plugin-license';

const path = require('path');

const LICENSE_CFG = {
  banner: {
    content: {
      file: path.join(__dirname, 'LICENSE'),
    },
  },
};

export default [
  {
    input: 'src/index.ts',
    output: [
      { file: 'build/lib.js', format: 'cjs' },
      { file: 'build/lib.min.js', format: 'cjs', plugins: [terser()] },
      { file: 'build/lib.esm.js', format: 'esm' },
    ],
    plugins: [
      typescript(),
      cleanup({ comments: 'none' }),
      nodeResolve(),
      license(LICENSE_CFG),
      analyze(),
    ],
  },
  {
    input: 'src/index.ts',
    output: [{ file: 'build/lib.d.ts', format: 'es' }],
    plugins: [
      dts(),
      cleanup({ comments: 'none' }),
      license(LICENSE_CFG),
      analyze(),
    ],
  },
];

