import type { LoggerType, LogEventState, MultiplexedFnType } from './types';

import { LOG_LEVELS } from './constants';

export const enumKeys = <
  O extends Record<string, any>,
  K extends keyof O = keyof O,
>(
  obj: O,
): K[] => Object.keys(obj).filter((k) => Number.isNaN(+k)) as K[];

// eslint-disable-next-line @typescript-eslint/no-empty-function
const NOOP: MultiplexedFnType = () => Promise.resolve([true]);

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
  obj: Partial<LogEventState> &
    Pick<LogEventState, 'levelName'> = {} as Partial<LogEventState> &
    Pick<LogEventState, 'levelName'>,
): LogEventState => ({
  ...obj,
  levelName: obj?.levelName || '',
  message: obj?.message || '',
  eventName: obj?.eventName || '',
  scope: obj?.scope || '',
  data: obj.data || {},
  consumer: obj.consumer || null,
});
