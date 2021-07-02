import { ConsoleConsumer } from './Consumers/Console';

import type {
  LoggerType,
  LogEventState,
  MultiplexedFnType,
  ConfigType,
  GenericFn,
  RefType,
} from './types';

import {
  addLoggingRules,
  fact,
  LogRulesEngine,
  withRulePatchHandlers,
  withRuleCheck,
} from './rules';

import { LOG_LEVELS } from './constants';
import {
  consumersMountAll,
  consumersUmountAll,
  getPublicLogEventFn,
} from './consumers';
import { enumKeys } from './utils';

export const DEFAULT_CONFIG: ConfigType = {
  consumers: [ConsoleConsumer],
  rules: () => {
    console.warn('LogService: WARNING: USING DEFAULT CONFIG');
    return { any: [] };
  },
};

const _mainScopeLoggerRef: { current: null | RefType } = { current: null };

export const mainScopeEntries = (): [string, MultiplexedFnType][] =>
  Object.entries(_mainScopeLoggerRef?.current?.loggers || {});

export const getNewLoggers = (config: ConfigType): RefType => {
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

  return { loggers, consumers: initializedConsumers };
};

export const initMainScopeLogger = (config: ConfigType): LoggerType => {
  _mainScopeLoggerRef.current = getNewLoggers(config);
  return _mainScopeLoggerRef.current?.loggers;
};

export const destroyMainScopeLogger = async (): Promise<boolean> => {
  await consumersUmountAll(_mainScopeLoggerRef.current?.consumers || []);
  _mainScopeLoggerRef.current = null;
  return true;
};

export const withMainScopeReady =
  (fn: GenericFn): GenericFn =>
  (...args: any[]) => {
    if (!_mainScopeLoggerRef.current) {
      initMainScopeLogger(DEFAULT_CONFIG);
    }
    return fn(...args);
  };
