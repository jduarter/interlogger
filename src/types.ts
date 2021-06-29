import type {
  CONSUMER_ANALYTICS_TYPE,
  CONSUMER_ERROR_REPORTER_TYPE,
  LOG_LEVELS,
} from './constants';

export type ConsumerTypes =
  | typeof CONSUMER_ANALYTICS_TYPE
  | typeof CONSUMER_ERROR_REPORTER_TYPE;

export type LogEventState = {
  levelName: '' | LogLevelStrings;
  message: string;
  eventName: string;
  scope: string;
  data: LogToLevelDataType;
  consumer: null | RenderedConsumer<any>;
};

export type LogServiceOptionsObjType = { __options?: Record<any, string> };

export type LogToLevelDataType<O = Record<string, any>> = O &
  LogServiceOptionsObjType;

// public interface
export type LogToLevelFnType = ((
  eventName: string,
  data: LogToLevelDataType,
) => void) &
  ((eventName: string, message: string, data: LogToLevelDataType) => void);

// internal interface
export type LogToLevelStateFn = (s: LogEventState) => void;

export type FwArgsType =
  | [LogEventState['eventName'], LogToLevelDataType]
  | [LogEventState['eventName'], LogEventState['message'], LogToLevelDataType];

export interface RenderedConsumer<O = Record<string, any>> {
  options: O;
  type: ConsumerTypes;
  name: string;
  handler: (state: LogEventState) => void;
  mount?: () => void;
  umount?: () => void;
}

export type Consumer<O = Record<string, any>> = (
  options: O,
) => RenderedConsumer<O>;

export type RuleSet = Record<string, any>;

export type FactType = (o: RuleSet) => RuleSet;

export interface ConfigType {
  consumers: Consumer[];
  rules: ({ fact }: { fact: FactType }) => RuleSet;
}

export type LogLevelStrings = keyof typeof LOG_LEVELS;

export type LoggerType = Record<LogLevelStrings, LogToLevelFnType>;

export type OnSuccessFnType = <D = Record<string, any>>(
  eventName: string,
  data: D,
) => void;
