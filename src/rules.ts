import { LogRulesEngine } from './init';

import type {
  OnSuccessFnType,
  FactType,
  LogEventState,
  RuleMatcher,
} from './types';

export const fact: FactType = (obj) => ({ fact: 'logEvent', ...obj });

export const addLoggingRules = (
  engine: typeof LogRulesEngine,
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
  engine: typeof LogRulesEngine,
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
}): { match: RuleMatcher; doesNotMatch: RuleMatcher; fact: FactType } => {
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
  (initialState: Partial<LogEventState>, eventHandleFn: OnSuccessFnType) =>
  (obj: Partial<LogEventState>): ReturnType<typeof eventToRulesEngine> =>
    eventToRulesEngine(
      LogRulesEngine,
      {
        ...initialState,
        ...obj,
      } as LogEventState,
      eventHandleFn,
    );
