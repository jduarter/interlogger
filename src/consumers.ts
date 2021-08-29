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
  InterloggerPlugin,
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

const processPlugins = (
  evData: LogEventStateFromPublic,
  plugins: InterloggerPlugin[],
): Promise<LogEventStateFromPublic> =>
  plugins.reduce(
    async (acc, curr) => await curr.handle(await acc),
    Promise.resolve(evData),
  );

const withEvData = async (
  evData: LogEventStateFromPublic,
  mpMembersFn: (evData: LogEventStateFromPublic) => Promise<boolean>[],
  plugins: InterloggerPlugin[],
) => Promise.all(mpMembersFn(await processPlugins(evData, plugins)));

const getMainConsumerMultiplexFn =
  (
    consumers: RenderedConsumer<any>[],
    initialState: Pick<LogEventState, 'levelName'>,
    plugins: InterloggerPlugin[],
  ): MultiplexedFnType =>
  async (state: LogEventStateFromPublic) =>
    withEvData(
      { ...initialState, ...state },
      (evData: LogEventStateFromPublic) =>
        multiplexEventForAllConsumers(consumers, initialState).map(
          async ({ acb, consumer }) => acb({ ...evData, consumer }),
        ),
      plugins,
    );

export const getPublicLogEventFn = (
  consumers: RenderedConsumer<any>[],
  initialState: Pick<LogEventState, 'levelName'>,
  plugins: InterloggerPlugin[] = [],
): MultiplexedFnType =>
  getMainConsumerMultiplexFn(consumers, initialState, plugins);

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
      consumers
        .filter((c) => !!c.umount)
        .map(async ({ umount = () => {} }) => {
          try {
            await umount();
            return true;
          } catch (err) {
            console.error('getPublicLogEventFn/init:', err);
            return false;
          }
        }),
    )
  ).filter((x) => !x).length === 0;
