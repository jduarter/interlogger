export * from './types';

import type { LoggerType } from './types';

import {
  withMainScopeReady,
  mainScopeEntries,
  initMainScopeLogger,
} from './init';

import { forwardArgsToFn } from './consumers';

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

export { withMainScopeReady, initMainScopeLogger };
