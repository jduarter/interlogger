import type {
  ConfigType,
  RenderedConsumer,
  LogEventState,
  LogToLevelFnType,
  FwArgsType,
  LogToLevelStateFn,
} from './types';

import { logEventState } from './init';

export const enumKeys = <O extends object, K extends keyof O = keyof O>(
  obj: O,
): K[] => Object.keys(obj).filter((k) => Number.isNaN(+k)) as K[];

export const logToLevelArgsToState = (
  args: FwArgsType,
): Partial<LogEventState> => {
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
    console.log('ARGS: ', args);
    throw new Error('forwardArgsToFn: Invalid arguments error');
  }
};
/*
export const sendToConsumers = (
  consumers: RenderedConsumer<any>[],
  state: LogEventState,
) => {
  console.log('*** sendToConsumers');
  for (const { handler, name } of consumers) {
    try {
      console.log('*** current mutated state is: ', {
        ...state,
        consumer: name,
      });
      handler({ ...state });
    } catch (err) {
      console.error('runWithHandlers: ERROR: ', err);
    }
  }
};*/

export const getConsumersForConfig = <O>(
  config: ConfigType,
  options: O = {} as O,
) => config.consumers.map((consumer) => consumer(options));

type MultiplexedFnType = (state: LogEventState) => Promise<void[]>;

type RenderedMultiplexedMember = {
  acb: (state: LogEventState) => Promise<void>;
  consumer: RenderedConsumer<any>;
};

const multiplexEventForAllConsumers = (
  consumers: RenderedConsumer<any>[],
  initialState: LogEventState,
) =>
  consumers.map(
    (consumer: RenderedConsumer<any>): RenderedMultiplexedMember => ({
      acb: async (state: LogEventState) => {
        await consumer.handler({ ...initialState, ...state });
        return;
      },
      consumer,
    }),
  );

const getMainConsumerMultiplexFn = (
  consumers: RenderedConsumer<any>[],
  initialState: LogEventState,
): MultiplexedFnType => {
  const multiplexedMembers = multiplexEventForAllConsumers(
    consumers,
    initialState,
  );

  const multiplexedMainFn: MultiplexedFnType = async (state: LogEventState) => {
    console.log('multiplexedMainFn: starts');

    const p = Promise.all(
      multiplexedMembers.map(async ({ acb, consumer }) => {
        console.log('MM: ', acb, consumer);

        const rr = acb({ ...initialState, ...state, consumer });
        console.log('RR: ', rr);
        return rr;
      }),
    );

    console.log('multiplexedMainFn: ', p);
    return p;
  };

  return multiplexedMainFn;
};

export const getPublicLogEventFn = (
  consumers: RenderedConsumer<any>[],
  initialState: LogEventState,
): MultiplexedFnType => {
  console.log('getPublicLogEventFn called', initialState);
  const multiplexedFn = getMainConsumerMultiplexFn(consumers, initialState);
  console.log('multiplexedFn: ', multiplexedFn);
  return multiplexedFn;
};

export const forwardArgsToFn =
  (fn: LogToLevelStateFn): LogToLevelFnType =>
  (...args: FwArgsType) => {
    const state = logToLevelArgsToState(args);
    return fn(logEventState(state));
  };

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
