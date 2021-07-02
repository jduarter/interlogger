const { Engine } = require('json-rules-engine');
export { Engine as RulesEngine };

import type {
  OnSuccessFnType,
  FactType,
  LogEventState,
  RuleHandlers,
} from './types';

export const fact: FactType = (obj) => ({ fact: 'logEvent', ...obj });

export const addLoggingRules = (
  engine: any, // @todo-type
  conditions: Record<string, any>,
): void =>
  engine.addRule({
    conditions,
    event: {
      type: 'scrutinized-log-event',
    },
  });

export const eventToRulesEngine = async <
  S extends OnSuccessFnType = OnSuccessFnType,
>(
  engine: any, // @todo-type
  logEvent: LogEventState,
  onSuccess: S,
): Promise<boolean> => {
  const { events } = await engine.run({ logEvent });

  const shouldTriggerConsumers: boolean = events.length === 1;
  if (shouldTriggerConsumers) {
    return onSuccess(logEvent);
  }
  return true;
};

export const withRulePatchHandlers = ({
  fact,
}: {
  fact: FactType;
}): RuleHandlers => {
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

  return { fact, match, doesNotMatch };
};

export const withRuleCheck = 
  (
    LogRulesEngine: any /*@todo-type*/,
    initialState: Partial<LogEventState>,
    eventHandleFn: OnSuccessFnType,
  ) =>
  (obj: Partial<LogEventState>): ReturnType<typeof eventToRulesEngine> =>
    eventToRulesEngine(
      LogRulesEngine,
      {
        ...initialState,
        ...obj,
      } as LogEventState,
      eventHandleFn,
    );
