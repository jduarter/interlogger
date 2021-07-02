import {
  withMainScopeReady,
  mainScopeEntries,
  initMainScopeLogger,
} from './init';

import { forwardArgsToFn } from './consumers';

import type {LoggerType} from './types';

export const loggerForScope = withMainScopeReady(
  (scope: string): LoggerType =>
    mainScopeEntries().reduce(
      (acc, [currName, currFn]) => ({
        ...acc,
        [currName]: forwardArgsToFn((state) => currFn({ ...state, scope })),
      }),
      {} as LoggerType,
    ),
);


export { ConsoleConsumer } from './Consumers/Console';
export { FlipperConsumer } from './Consumers/Flipper';
export { withMainScopeReady, initMainScopeLogger };
