import typescript from '@rollup/plugin-typescript';
import dts from 'rollup-plugin-dts';
import { terser } from 'rollup-plugin-terser';
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
      { file: 'build/interlogger.js', format: 'cjs' },
      {
        file: 'build/interlogger.min.js',
        format: 'cjs',
        plugins: [terser()],
      },
      { file: 'build/interlogger.esm.js', format: 'esm' },
    ],
    plugins: [
      typescript(),
      cleanup({ comments: 'none' }),
      license(LICENSE_CFG),
      analyze(),
    ],
  },
  {
    input: 'src/types.ts',
    output: [{ file: 'build/interlogger.d.ts', format: 'es' }],
    plugins: [
      dts(),
      cleanup({ comments: 'none' }),
      license(LICENSE_CFG),
      analyze(),
    ],
  },
];
