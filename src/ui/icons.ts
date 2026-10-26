import { BatteryCharging, Gauge, Heartbeat, Leaf, ShieldCheck } from '@phosphor-icons/react'
import type { TabKey } from '../data/schema'

/** Icon shown for each passport tab. */
export const TAB_ICONS = {
  basic: BatteryCharging,
  performance: Gauge,
  materials: Leaf,
  health: Heartbeat,
  compliance: ShieldCheck,
} satisfies Record<TabKey, unknown>

export const ICON_DEFAULTS = { weight: 'fill', size: 20 } as const
