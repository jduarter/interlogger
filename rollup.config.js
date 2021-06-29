import typescript from '@rollup/plugin-typescript';
import dts from 'rollup-plugin-dts';
import { terser } from 'rollup-plugin-terser';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import { preserveShebangs } from 'rollup-plugin-preserve-shebangs';
import cleanup from 'rollup-plugin-cleanup';
import analyze from 'rollup-plugin-analyzer';
import license from 'rollup-plugin-license';

const path=require('path');

const LICENSE_CFG = {
  banner: {
    content: {
      file: path.join(__dirname, 'LICENSE'),
    },
  },
};

export default [
  {
    input: 'src/expoize.ts',
    output: [
      { file: 'build/expoize.js', format: 'cjs' },
      { file: 'build/expoize.min.js', format: 'cjs', plugins: [terser()] },
      { file: 'build/expoize.esm.js', format: 'esm' },
    ],
    plugins: [
      typescript(),
      cleanup({ comments: 'none' }),
      nodeResolve(),
      license(LICENSE_CFG),
      preserveShebangs(),
      analyze(),
    ],
  },
  {
    input: 'src/types.ts',
    output: [{ file: 'build/expoize.d.ts', format: 'es' }],
    plugins: [
      dts(),
      cleanup({ comments: 'none' }),
      license(LICENSE_CFG),
      analyze(),
    ],
  },
];
