import type {
  ConfigType,
  RenderedConsumer,
  LogEventState,
  LogToLevelFnType,
  FwArgsType,
  LogToLevelStateFn,
  MultiplexedFnType,
  LogEventStateFromPublic,
  RenderedMultiplexedMember,
} from './types';

import { logEventState } from './utils';

export const logToLevelArgsToState = (
  args: FwArgsType,
): Pick<LogEventState, 'message' | 'data' | 'eventName'> => {
  if (args.length === 2) {
    return {
      message: '',
      data: { ...args[1] },
      eventName: args[0],
    };
  } else if (args.length === 3) {
    return {
      message: args[1],
      data: { ...args[2] },
      eventName: args[0],
    };
  } else {
    throw new Error('forwardArgsToFn: Invalid arguments error');
  }
};

export const getConsumersForConfig = <O>(
  config: ConfigType,
  options: O = {} as O,
): RenderedConsumer<unknown>[] =>
  config.consumers.map((consumer) => consumer(options));

const multiplexEventForAllConsumers = (
  consumers: RenderedConsumer<any>[],
  initialState: Pick<LogEventState, 'levelName'>,
) =>
  consumers.map(
    (consumer: RenderedConsumer<any>): RenderedMultiplexedMember => ({
      acb: async (state) =>
        consumer.handler(logEventState({ ...initialState, ...state })),
      consumer,
    }),
  );

const getMainConsumerMultiplexFn = (
  consumers: RenderedConsumer<any>[],
  initialState: Pick<LogEventState, 'levelName'>,
): MultiplexedFnType => {
  const multiplexedMembers = multiplexEventForAllConsumers(
    consumers,
    initialState,
  );

  const multiplexedMainFn: MultiplexedFnType = async (
    state: LogEventStateFromPublic,
  ) =>
    Promise.all(
      multiplexedMembers.map(async ({ acb, consumer }) =>
        acb({ ...initialState, ...state, consumer }),
      ),
    );

  return multiplexedMainFn;
};

export const getPublicLogEventFn = (
  consumers: RenderedConsumer<any>[],
  initialState: Pick<LogEventState, 'levelName'>,
): MultiplexedFnType => getMainConsumerMultiplexFn(consumers, initialState);

export const forwardArgsToFn =
  (fn: LogToLevelStateFn): LogToLevelFnType =>
  (...args: FwArgsType) =>
    fn(logToLevelArgsToState(args));

export const consumersMountAll = <
  O extends Record<string, unknown> = Record<string, any>,
  RC extends RenderedConsumer<O> = RenderedConsumer<O>,
>(
  config: ConfigType,
): RC[] => {
  console.log('consumersMountAll called: ', config);
  const initializedConsumers: RC[] = [];

  for (const consumer of getConsumersForConfig<O>(config)) {
    if (consumer.mount) {
      try {
        consumer.mount();
      } catch (err) {
        console.error('getPublicLogEventFn/init:', err);
      }
    }

    initializedConsumers.push(consumer as RC);
  }

  return initializedConsumers;
};

export const consumersUmountAll = async (
  consumers: RenderedConsumer<any>[],
): Promise<boolean> =>
  (
    await Promise.all(
      consumers.map(async (consumer) => {
        if (!consumer.umount) {
          return true;
        }
        try {
          await consumer.umount();
          return true;
        } catch (err) {
          console.error('getPublicLogEventFn/init:', err);
          return false;
        }
      }),
    )
  ).filter((x) => !x).length === 0;
