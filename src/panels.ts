/**
 * Panel addressing helpers.
 *
 * A Smart Panel is panelId 0 (the master); attached expansion panels are 1-4.
 * Every key-addressed action, feedback and variable is scoped to a panel.
 */

export const PANEL_CHOICES = [
	{ id: 0, label: 'Master Panel (Panel 0)' },
	{ id: 1, label: 'Expansion Panel 1 (Panel 1)' },
	{ id: 2, label: 'Expansion Panel 2 (Panel 2)' },
	{ id: 3, label: 'Expansion Panel 3 (Panel 3)' },
	{ id: 4, label: 'Expansion Panel 4 (Panel 4)' },
]

export const MASTER_PANEL = 0
export const MAX_PANEL_ID = 4
export const ALL_PANEL_IDS = [0, 1, 2, 3, 4]

/**
 * Variable-name prefix for a panel.
 *
 * The master panel deliberately has NO prefix, so `key_5_muted` and `muted_keys`
 * keep working exactly as before for everyone already using them. Expansion
 * panels get `p1_`, `p2_`, ... - e.g. `p2_key_5_muted`.
 */
export function variablePrefix(panelId: number): string {
	return panelId === MASTER_PANEL ? '' : `p${panelId}_`
}

/** Human label used in variable descriptions. */
export function panelLabel(panelId: number): string {
	return panelId === MASTER_PANEL ? 'Master' : `Expansion ${panelId}`
}
