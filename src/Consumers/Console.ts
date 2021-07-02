import { CONSUMER_ERROR_REPORTER_TYPE } from '../constants';

import type { Consumer, LogEventState } from '../types';

export const CONSOLE_CONSUMER_NAME = 'Console';

const consoleConsumerHandler = (state: LogEventState) => {
  const { levelName, eventName, scope, message, data } = state;

  // eslint-disable-next-line security/detect-object-injection
  console[levelName]('[' + scope + '] ' + eventName + ': ' + message, data);

  return true;
};

type Options = Record<string, unknown>;

export const ConsoleConsumer: Consumer<Options> = (options: Options) => ({
  type: CONSUMER_ERROR_REPORTER_TYPE,
  name: CONSOLE_CONSUMER_NAME,
  options,
  handler: consoleConsumerHandler,
});
