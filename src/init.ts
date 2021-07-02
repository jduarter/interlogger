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
  RulesEngine,
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

export const getNewLoggers = (config: ConfigType): RefType => {
  const initializedConsumers = consumersMountAll(config);

  const rules = config.rules(withRulePatchHandlers({ fact }));

  const LogRulesEngine = new RulesEngine();

  addLoggingRules(LogRulesEngine, rules);

  const getLogFn = (
    initialState: Pick<LogEventState, 'levelName'>,
  ): MultiplexedFnType =>
    getPublicLogEventFn(
      initializedConsumers.map((ic) => ({
        ...ic,
        handler: withRuleCheck(LogRulesEngine, initialState, (s) =>
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

export const initMainScopeLogger = (
  config: ConfigType,
  overwrite: boolean = false,
): LoggerType => {
  if (_mainScopeLoggerRef.current?.loggers && !overwrite) {
    return _mainScopeLoggerRef.current.loggers;
  }

  const newLoggers = getNewLoggers(config);

  _mainScopeLoggerRef.current = newLoggers;
  return _mainScopeLoggerRef.current.loggers;
};

export const destroyMainScopeLogger = async (): Promise<boolean> => {
  if (!_mainScopeLoggerRef.current?.loggers) {
    return true;
  }

  consumersUmountAll(_mainScopeLoggerRef.current?.consumers || []);
  _mainScopeLoggerRef.current = null;

  return true;
};

export const withMainScopeReady = <T extends unknown = GenericFn>(fn: any): T =>
  ((...args: any[]) => {
    if (!_mainScopeLoggerRef.current) {
      initMainScopeLogger(DEFAULT_CONFIG);
    }
    return fn(_mainScopeLoggerRef)(...args);
  }) as T;
