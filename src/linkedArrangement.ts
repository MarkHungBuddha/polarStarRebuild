import type { LinkedInteraction, LinkedMetric } from './redesignTypes';

/** Content describes arithmetic in original units; it never supplies scoring thresholds. */
export function linkedMetricValue(interaction: LinkedInteraction, metric: LinkedMetric, value: number): number {
  const source = metric.source === 'value' ? value : (interaction.resourceTotal ?? interaction.max) - value;
  const scaled = source * (metric.multiplier ?? 1);
  return Math.max(metric.minimum ?? -Infinity, metric.subtractFrom === undefined ? scaled : metric.subtractFrom - scaled);
}

export function linkedArrangement(interaction: LinkedInteraction, value: number): string {
  const parts = [`${interaction.label} ${value} ${interaction.unit}`];
  if (interaction.resourceSides && interaction.resourceTotal !== undefined) parts.push(`${interaction.resourceSides[1].label} ${interaction.resourceTotal - value} ${interaction.unit}`);
  for (const metric of interaction.metrics ?? []) parts.push(`${metric.label} ${linkedMetricValue(interaction, metric, value)} ${metric.unit}`);
  return parts.join('；');
}
