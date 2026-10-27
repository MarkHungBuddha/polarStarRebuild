import type { AllocationSide } from './interactiveTypes';

/** Raw decisions, independent of their eventual direction. Kept alongside the legacy answer shapes. */
/** `unit` names one slot in the live count (default 天) and `label` names the calendar for assistive technology (default 行事曆). */
export interface CalendarInteraction { kind: 'calendar'; slots: readonly string[]; sides: readonly [AllocationSide, AllocationSide]; unit?: string; label?: string }
export interface ResourceInteraction { kind: 'resources'; objects: readonly string[]; unit: string; sides: readonly [AllocationSide, AllocationSide]; initial?: readonly (0 | 1)[] }
export interface SceneInteraction { kind: 'scene'; object: string; transitionLabel?: string; locations: readonly { id: string; label: string; action?: string; consequence: string; valueId?: AllocationSide['valueId'] }[] }
export interface MessageInteraction { kind: 'message'; sentences: readonly { id: string; text: string }[] }
export interface PriorityInteraction { kind: 'priority'; capacity: number; keepLabel: string; deferLabel: string; resourceUnit?: string; items: readonly { id: string; label: string; detail: string; valueId?: AllocationSide['valueId'] }[] }
export interface LinkedMetric { label: string; unit: string; source: 'value' | 'remainder'; multiplier?: number; subtractFrom?: number; minimum?: number }
export interface LinkedInteraction {
  kind: 'linked'; min: number; max: number; step: number; initial: number; unit: string; label: string; consequence: string;
  presentation?: { kind: 'clock'; startHour: number } | { kind: 'calendar' };
  metrics?: readonly LinkedMetric[];
  /** Only an explicitly fixed total of the same resource can yield a direction. */
  resourceTotal?: number; resourceSides?: readonly [AllocationSide, AllocationSide];
}
export type RedesignInteraction = CalendarInteraction | ResourceInteraction | SceneInteraction | MessageInteraction | PriorityInteraction | LinkedInteraction;

export interface CalendarAnswer { kind: 'calendar'; variantId: string; placements: readonly (0 | 1)[] }
export interface ResourceAnswer { kind: 'resources'; variantId: string; placements: readonly (0 | 1)[]; kept: boolean }
export interface SceneAnswer { kind: 'scene'; variantId: string; locationId: string }
export interface MessageAnswer { kind: 'message'; variantId: string; keptIds: readonly string[]; sent: boolean }
export interface PriorityAnswer { kind: 'priority'; variantId: string; order: readonly string[]; kept: boolean }
export interface LinkedAnswer { kind: 'linked'; variantId: string; value: number; kept: boolean }
export type RedesignAnswer = CalendarAnswer | ResourceAnswer | SceneAnswer | MessageAnswer | PriorityAnswer | LinkedAnswer;
