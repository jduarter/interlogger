import { CONSUMER_ERROR_REPORTER_TYPE } from '../constants';

import type { Consumer, LogEventState } from '../types';

export const CONSOLE_CONSUMER_NAME = 'Console';

const consoleConsumerHandler = (state: LogEventState) => {
  const {
    levelName,
    message,
    data: { scope, event, ...restOfdata },
  } = state;

  console.log('STATE IS: ', state);
  console[levelName]('[' + scope + '] ' + event + ': ' + message, restOfdata);
};

type Options = Record<string, unknown>;

export const ConsoleConsumer: Consumer<Options> = (options: Options) => ({
  type: CONSUMER_ERROR_REPORTER_TYPE,
  name: CONSOLE_CONSUMER_NAME,
  options,
  handler: consoleConsumerHandler,
});
