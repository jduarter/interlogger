import type {
  CONSUMER_ANALYTICS_TYPE,
  CONSUMER_ERROR_REPORTER_TYPE,
  LOG_LEVELS,
} from './constants';

export type ConsumerTypes =
  | typeof CONSUMER_ANALYTICS_TYPE
  | typeof CONSUMER_ERROR_REPORTER_TYPE;

export interface LogEventState {
  levelName: LogLevelStrings;
  message: string;
  eventName: string;
  scope: string;
  data: LogToLevelDataType;
  consumer: null | RenderedConsumer<any>;
}

export interface LogServiceOptionsObjType {
  __options?: Record<any, string>;
}

export type LogToLevelDataType<O = Record<string, any>> = O &
  LogServiceOptionsObjType;

// public interface
export type LogToLevelFnType = ((
  eventName: string,
  data: LogToLevelDataType,
) => void) &
  ((eventName: string, message: string, data: LogToLevelDataType) => void);

// internal interface

export type AutohandledLogEventProperties = 'levelName' | 'scope' | 'consumer';

export type LogEventStateFromPublic = Omit<
  LogEventState,
  AutohandledLogEventProperties
>;
export type LogToLevelStateFn = (
  s: LogEventStateFromPublic,
) => Promise<boolean[]>;

export type FwArgsType =
  | [LogEventState['eventName'], LogToLevelDataType]
  | [LogEventState['eventName'], LogEventState['message'], LogToLevelDataType];

export interface RenderedConsumer<O = Record<string, any>> {
  options: O;
  type: ConsumerTypes;
  name: string;
  handler: (state: LogEventState) => boolean | Promise<boolean>;
  mount?: () => void;
  umount?: () => void;
}

export interface RenderedMultiplexedMember {
  acb: (
    state: LogEventStateFromPublic & Pick<LogEventState, 'consumer'>,
  ) => Promise<boolean>;
  consumer: RenderedConsumer<any>;
}

export type Consumer<O = Record<string, any>> = (
  options: O,
) => RenderedConsumer<O>;

export type RuleSet = Record<string, any>;

export type FactType = (o: RuleSet) => RuleSet;

export type RuleMatcher = (path: string, value: any) => RuleSet;

export type RuleHandlers = {
  match: RuleMatcher;
  doesNotMatch: RuleMatcher;
  fact: FactType;
};

export interface ConfigType {
  consumers: Consumer[];
  rules: (handlers: RuleHandlers) => RuleSet;
}

export type LogLevelStrings = keyof typeof LOG_LEVELS;

export type LoggerType = Record<LogLevelStrings, MultiplexedFnType>;

export type OnSuccessFnType = (
  state: LogEventState,
) => boolean | Promise<boolean>;

export type MultiplexedFnType = (
  state: LogEventStateFromPublic & Pick<LogEventState, 'scope'>,
) => Promise<boolean[]>;

export type GenericFn = (...a: any[]) => any;

export type RefType = {
  loggers: LoggerType;
  consumers: RenderedConsumer<any>[];
};
