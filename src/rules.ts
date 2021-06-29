import { LogRulesEngine } from './init';

import type {
  OnSuccessFnType,
  LogLevelStrings,
  LogToLevelStateFn,
  FactType,
  LogEventState,
} from './types';

export const fact: FactType = (obj) => ({ fact: 'logEvent', ...obj });

export const addLoggingRules = (
  engine: typeof LogRulesEngine,
  conditions: Record<string, any>,
) =>
  engine.addRule({
    conditions,
    event: {
      type: 'scrutinized-log-event',
    },
  });

export const eventToRulesEngine = async <
  S extends OnSuccessFnType = OnSuccessFnType,
>(
  engine: typeof LogRulesEngine,
  logEvent: LogEventState,
  onSuccess: S,
): Promise<void> => {
  const { events } = await engine.run({ logEvent });
  const shouldTriggerConsumers: boolean = events.length === 1;
  if (shouldTriggerConsumers) {
    const { message, data } = logEvent;
    onSuccess(message, data);
  }
  return;
};

export const withRulePatchHandlers = ({ fact }: { fact: FactType }) => {
  const match = (path: string, value: any) =>
    fact({
      path,
      operator: 'equal',
      value,
    });

  const doesNotMatch = (path: string, value: any) =>
    fact({
      path,
      operator: 'notEqual',
      value,
    });

  return { match, doesNotMatch };
};

export const withRuleCheck =
  (
    levelName: LogLevelStrings,
    eventHandleFn: OnSuccessFnType,
  ): LogToLevelStateFn =>
  (obj) =>
    eventToRulesEngine(
      LogRulesEngine,
      {
        ...obj,
        levelName,
      },
      eventHandleFn,
    );
