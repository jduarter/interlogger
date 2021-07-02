import type { LoggerType, LogEventState, MultiplexedFnType } from './types';

import { LOG_LEVELS } from './constants';
import { enumKeys } from './consumers';

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
