import { ConsoleConsumer } from './Consumers/Console';

const { Engine } = require('json-rules-engine');

import type { LoggerType, ConfigType, LogEventState } from './types';

import {
  addLoggingRules,
  fact,
  withRulePatchHandlers,
  //withRuleCheck,
} from './rules';

import { LOG_LEVELS } from './constants';
import { consumersMountAll, enumKeys, getPublicLogEventFn } from './consumers';

const NOOP = () => {};

export const Logger = (obj: Partial<LoggerType> = {}): LoggerType => ({
  ...obj,
  ...enumKeys(LOG_LEVELS).reduce(
    (acc, logLevelName: string) => ({
      ...acc,
      [logLevelName]: NOOP,
    }),
    {} as LoggerType,
  ),
});

export const logEventState = (
  obj: Partial<LogEventState> = {},
): LogEventState => ({
  ...obj,
  levelName: obj?.levelName || '',
  message: obj?.message || '',
  eventName: obj?.eventName || '',
  scope: obj?.scope || '',
  data: obj.data || {},
  consumer: obj.consumer || null,
});

export const LogRulesEngine = new Engine();

export const DEFAULT_CONFIG = {
  consumers: [ConsoleConsumer],
  rules: () => {
    console.warn('LogService: WARNING: USING DEFAULT CONFIG');
    return { any: [] };
  },
};

const _mainScopeLoggerRef: { current: null | LoggerType } = { current: null };

export const mainScopeEntries = () =>
  Object.entries(_mainScopeLoggerRef?.current || {});

export const getNewLoggers = (config: ConfigType): LoggerType => {
  console.log('----> getNewLoggers');
  const initializedConsumers = consumersMountAll(config);

  addLoggingRules(
    LogRulesEngine,
    config.rules({ fact, ...withRulePatchHandlers({ fact }) }),
  );

  const precomputedFn = (state: LogEventState) =>
    getPublicLogEventFn(
      initializedConsumers,
      logEventState({
        ...state,
      }),
    );

  const loggers = enumKeys(LOG_LEVELS).reduce(
    (acc, currName) => ({
      ...acc,
      [currName]: (state: LogEventState) => {
        console.log('+++ logger.' + currName);
        return precomputedFn({ ...state, levelName: currName });
      } /*withRuleCheck(currName, (eventName, data) =>
        getPublicLogEventFn(
          initializedConsumers,
          logEventState({
            levelName: currName,
            eventName,
            data,
          }),
        ),
      ),*/,
    }),
    {} as LoggerType,
  );

  return loggers;
};

export const initMainScopeLogger = (config: ConfigType): LoggerType => {
  console.log('*** initMainScopeLogger');
  _mainScopeLoggerRef.current = getNewLoggers(config);
  return _mainScopeLoggerRef.current as LoggerType;
};

export const withMainScopeReady = (fn: Function): Function => {
  return (...args: any[]) => {
    if (!_mainScopeLoggerRef.current) {
      initMainScopeLogger(DEFAULT_CONFIG);
    }
    return fn(...args);
  };
};
