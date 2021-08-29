import {
  withMainScopeReady,
  initMainScopeLogger,
  destroyMainScopeLogger,
} from './init';

import { forwardArgsToFn } from './consumers';

import type { LoggerType, MultiplexedFnType } from './types';

type LoggerForScopeFn = (scope: string) => LoggerType;

export const loggerForScope = withMainScopeReady<LoggerForScopeFn>(
  (instance: any) => (scope: string) =>
    instance?.current?.loggers
      ? Object.entries<MultiplexedFnType>(instance.current.loggers).reduce(
          (acc, [currName, currFn]: [string, MultiplexedFnType]) => ({
            ...acc,
            [currName]: forwardArgsToFn((state) => currFn({ ...state, scope })),
          }),
          {} as LoggerType,
        )
      : {},
);

export { ConsoleConsumer } from './Consumers/Console';
export { FlipperConsumer } from './Consumers/Flipper';
export { withMainScopeReady, initMainScopeLogger, destroyMainScopeLogger };
