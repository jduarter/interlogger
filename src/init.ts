import { ConsoleConsumer } from './Consumers/Console';

import type {
  LoggerType,
  LogEventState,
  MultiplexedFnType,
  ConfigType,
} from './types';

import {
  addLoggingRules,
  fact,
  LogRulesEngine,
  withRulePatchHandlers,
  withRuleCheck,
} from './rules';

import { LOG_LEVELS } from './constants';
import { consumersMountAll, getPublicLogEventFn } from './consumers';
import { enumKeys } from './utils';

export const DEFAULT_CONFIG: ConfigType = {
  consumers: [ConsoleConsumer],
  rules: () => {
    console.warn('LogService: WARNING: USING DEFAULT CONFIG');
    return { any: [] };
  },
};

const _mainScopeLoggerRef: { current: null | LoggerType } = { current: null };

export const mainScopeEntries = (): [string, MultiplexedFnType][] =>
  Object.entries(_mainScopeLoggerRef?.current || {});

export const getNewLoggers = (config: ConfigType): LoggerType => {
  const initializedConsumers = consumersMountAll(config);

  addLoggingRules(
    LogRulesEngine,
    config.rules(withRulePatchHandlers({ fact })),
  );

  const getLogFn = (
    initialState: Pick<LogEventState, 'levelName'>,
  ): MultiplexedFnType =>
    getPublicLogEventFn(
      initializedConsumers.map((ic) => ({
        ...ic,
        handler: withRuleCheck(initialState, (s) =>
          ic.handler({ ...initialState, ...s }),
        ),
      })),
      initialState,
    );

  const loggers = enumKeys(LOG_LEVELS).reduce(
    (acc, levelName) => ({
      ...acc,
      [levelName]: getLogFn({ levelName }),
    }),
    {} as LoggerType,
  );

  return loggers;
};

export const initMainScopeLogger = (config: ConfigType): LoggerType => {
  _mainScopeLoggerRef.current = getNewLoggers(config);
  return _mainScopeLoggerRef.current;
};

type GenericFn = (...a: any[]) => any;

export const withMainScopeReady =
  (fn: GenericFn): GenericFn =>
  (...args: any[]) => {
    if (!_mainScopeLoggerRef.current) {
      initMainScopeLogger(DEFAULT_CONFIG);
    }
    return fn(...args);
  };
