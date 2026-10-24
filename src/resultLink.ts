import { baseValues } from './data';
import { catalogVersion, questionPlan, selectQuestions } from './questionPlan';
import { act1TopThree, byPosition, scenarioTallies, scenarioTopThree } from './valueRanking';
import type { Scenario, Session } from './types';

/** A second-act row: the values sharing one position, with the leans and leaning appearances they share. */
export interface SharedChosenRow { ids: string[]; chosen: number; directional: number }

/** The conclusion a result link carries, as it was when shared: positions come from row order and row sizes. */
export interface SharedResult {
  stated: string[][];
  chosen: SharedChosenRow[];
  catalog: string;
  plan: string[];
}

export type ResultLinkOutcome =
  | { kind: 'result'; result: SharedResult; questions?: Scenario[] }
  | { kind: 'corrupt' };

const coreIds = new Set(baseValues.map(value => value.id));
const base36 = /^[1-9a-z][0-9a-z]*$/;

export function sharedResultOf(session: Session): SharedResult | undefined {
  const plan = questionPlan(session.scenarios);
  if (!plan) return undefined;
  return {
    stated: byPosition(act1TopThree(session.values)).map(row => row.items.map(value => value.id)),
    chosen: byPosition(scenarioTopThree(scenarioTallies(session))).map(row => ({ ids: row.items.map(tally => tally.value.id), chosen: row.items[0].chosen, directional: row.items[0].directional })),
    catalog: catalogVersion,
    plan,
  };
}

/** Format version 1: `r=1.<first act>.<second act>.<custom values>.<v>.<plan>` (docs/result-share-spec.md). */
export function resultLink(result: SharedResult, location: Pick<Location, 'origin' | 'pathname'>): string {
  const stated = result.stated.map(row => row.join('-')).join('~');
  const chosen = result.chosen.map(row => [row.chosen.toString(36), row.directional.toString(36), ...row.ids].join('-')).join('~');
  return `${new URL(location.pathname, location.origin).href}#r=1.${stated}.${chosen}..${result.catalog}.${result.plan.join('-')}`;
}

/** Reads a result link from the address fragment; anything that is not `#r=…` is not a result link. Every field is checked before any of it is shown. */
export function readResultLink(hash: string): ResultLinkOutcome | undefined {
  if (!hash.startsWith('#r=')) return undefined;
  const fields = hash.slice(3).split('.');
  if (fields.length !== 6 || fields[0] !== '1') return { kind: 'corrupt' };
  const [, statedField, chosenField, customField, catalog, planField] = fields;
  const ids = (text: string[]) => text.length > 0 && text.every(id => coreIds.has(id)) ? text : undefined;
  const stated = statedField.split('~').map(row => ids(row.split('-')));
  const chosen = chosenField === '' ? [] : chosenField.split('~').map(row => {
    const [chosenCount, directional, ...rowIds] = row.split('-');
    return base36.test(chosenCount) && base36.test(directional) && ids(rowIds) ? { ids: rowIds, chosen: parseInt(chosenCount, 36), directional: parseInt(directional, 36) } : undefined;
  });
  const plan = planField.split('-');
  if (stated.some(row => !row) || chosen.some(row => !row) || customField !== '' || !/^c[0-9a-z]+$/.test(catalog) || !plan.every(selector => /^[0-9a-z]+$/.test(selector))) return { kind: 'corrupt' };
  const result: SharedResult = { stated: stated as string[][], chosen: chosen as SharedChosenRow[], catalog, plan };
  if (catalog !== catalogVersion) return { kind: 'result', result };
  try { return { kind: 'result', result, questions: selectQuestions(new Set(), `p.${plan.join('.')}`) }; }
  catch { return { kind: 'corrupt' }; }
}
