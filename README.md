# interlogger

[![NPM](https://img.shields.io/npm/v/interlogger)](https://github.com/jduarter/interlogger)
[![type-coverage](https://img.shields.io/badge/dynamic/json.svg?label=type-coverage&prefix=%E2%89%A5&suffix=%&query=$.typeCoverage.atLeast&uri=https%3A%2F%2Fraw.githubusercontent.com%2Fjduarter%2Finterlogger%2Fmaster%2Fpackage.json)](https://github.com/jduarter/interlogger)
<a href="https://codeclimate.com/github/jduarter/interlogger/maintainability"><img src="https://api.codeclimate.com/v1/badges/b2d14de2ab2bfc28a5f6/maintainability" /></a>

interlogger: the definitive Open Source solution for proper logging regardless of your environment.

Warning: This project is on pre-release stage. Using it in production might not be a good idea unless you're an adventurer one.

## Usage

### Install as `depedency`

Install:

```
npm install --save interlogger
```

### Implementation example

```
import { addPlugin as flipperPlugin } from 'react-native-flipper';

import {
  initMainScopeLogger,
  FlipperConsumer,
  ConsoleConsumer,
} from 'interlogger';

import type { Consumer } from 'interlogger';

const LOG_CONSUMERS: Consumer[] = [
  ConsoleConsumer,
  FlipperConsumer({
    flipperPlugin,
  }),
];

export const initLoggers = (): void => {
  initMainScopeLogger({
    consumers: LOG_CONSUMERS,
    rules: ({ doesNotMatch }) => ({
      all: [
          /* Log if:
           *   consumer.name != 'Flipper' &&
           *   scope != 'useGeneratorQueue'
           */
        doesNotMatch('$.consumer.name', 'Flipper'),
        doesNotMatch('$.scope', 'useGeneratorQueue'),
      ],
    }),
  });
};

export { loggerForScope } from 'interlogger';
```

## License.

This project is licensed with MIT.

Copyright 2021 (c) Jorge Duarte Rodríguez <info@malagadev.com>

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
