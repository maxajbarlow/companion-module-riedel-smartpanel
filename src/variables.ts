import { CompanionVariableDefinition, CompanionVariableValues } from '@companion-module/base'
import { variablePrefix, panelLabel, MASTER_PANEL } from './panels.js'

/**
 * Variable definitions. `panels` lists the panels to expose key state for -
 * the master alone until expansion panels are discovered, then one set per panel.
 * The master's names are unprefixed so existing buttons keep working.
 */
export function getVariableDefinitions(panels: number[] = [MASTER_PANEL]): CompanionVariableDefinition[] {
	const defs: CompanionVariableDefinition[] = [
		{
			name: 'Connection Status',
			variableId: 'connection_status',
		},
		{
			name: 'Media1 IP Address',
			variableId: 'media1_ip',
		},
		{
			name: 'Config1 IP Address',
			variableId: 'config1_ip',
		},
		{
			name: 'Media2 IP Address',
			variableId: 'media2_ip',
		},
		{
			name: 'Media1 MAC Address',
			variableId: 'media1_mac_address',
		},
		{
			name: 'Config1 MAC Address',
			variableId: 'config1_mac_address',
		},
		{
			name: 'Media2 MAC Address',
			variableId: 'media2_mac_address',
		},
		{
			name: 'Expansion1 MAC Address',
			variableId: 'expansion1_mac_address',
		},
		{
			name: 'Media1 Link Status',
			variableId: 'media1_link_status',
		},
		{
			name: 'Config1 Link Status',
			variableId: 'config1_link_status',
		},
		{
			name: 'Media2 Link Status',
			variableId: 'media2_link_status',
		},
		{
			name: 'Expansion1 Link Status',
			variableId: 'expansion1_link_status',
		},
		{
			name: 'Media1 Speed',
			variableId: 'media1_speed',
		},
		{
			name: 'Media2 Speed',
			variableId: 'media2_speed',
		},
		{
			name: 'Media1 External Port',
			variableId: 'media1_external_port',
		},
		{
			name: 'Media2 External Port',
			variableId: 'media2_external_port',
		},
		{
			name: 'Device Name',
			variableId: 'device_name',
		},
		{
			name: 'Firmware Version',
			variableId: 'firmware_version',
		},
		{
			name: 'Headset A Connector Type',
			variableId: 'headset_a_connector_type',
		},
		{
			name: 'Headset B Connector Type',
			variableId: 'headset_b_connector_type',
		},
		{
			name: 'Panel Type',
			variableId: 'panel_type',
		},
		{
			name: 'Serial Number',
			variableId: 'serial_number',
		},
		{
			name: 'MAC Address',
			variableId: 'mac_address',
		},
		{
			name: 'Identify Enabled',
			variableId: 'identify_enabled',
		},
		{
			name: 'Artist Connection Status',
			variableId: 'artist_connection_status',
		},
		{
			name: 'Artist Name',
			variableId: 'artist_name',
		},
		{
			name: 'Health Status',
			variableId: 'health_status',
		},
		{
			name: 'Alarm Count',
			variableId: 'alarm_count',
		},
		{
			name: 'PTP Status',
			variableId: 'ptp_status',
		},
		{
			name: 'PTP Time Transmitter (Master Clock)',
			variableId: 'ptp_master',
		},
		{
			name: 'PTP Domain',
			variableId: 'ptp_domain',
		},
		{
			name: 'PTP Hybrid Mode',
			variableId: 'ptp_hybrid_mode',
		},
		{
			name: 'PTP Time Receiver Only',
			variableId: 'ptp_receiver_only',
		},
		{
			name: 'Control Panel Enabled',
			variableId: 'control_panel_enabled',
		},
		{
			name: 'NMOS Enabled',
			variableId: 'nmos_enabled',
		},
		{
			name: 'NMOS Status',
			variableId: 'nmos_status',
		},
		{
			name: 'Identify Status',
			variableId: 'identify_status',
		},
		// Key-press monitoring (from the /live-view connection). Key numbers are 1-based.
		{
			name: 'Last Lever Key (most recent lever event, 1-based)',
			variableId: 'last_lever_key',
		},
		{
			name: 'Last Lever State (Up / Down / Released)',
			variableId: 'last_lever_state',
		},
		{
			name: 'Last Lever Panel (0 = master, 1-4 = expansion)',
			variableId: 'last_lever_panel',
		},
		{
			name: 'Last Button Key (most recent encoder-push event, 1-based)',
			variableId: 'last_button_key',
		},
		{
			name: 'Last Button State (Pressed / Released)',
			variableId: 'last_button_state',
		},
		{
			name: 'Last Button Panel (0 = master, 1-4 = expansion)',
			variableId: 'last_button_panel',
		},
		{
			name: 'Mute Snapshot: stored slot names',
			variableId: 'mute_snapshot_slots',
		},
		{
			name: 'Mute Snapshot: most recently captured slot',
			variableId: 'mute_snapshot_last',
		},
		{
			name: 'Mute Snapshot: keys that were muted in that snapshot',
			variableId: 'mute_snapshot_last_muted',
		},
		{
			name: 'Mute Snapshot: number of keys captured',
			variableId: 'mute_snapshot_last_size',
		},
		{
			name: 'Panels Detected (comma-separated panel ids)',
			variableId: 'panels',
		},
		{
			name: 'Panel Count (master + attached expansion panels)',
			variableId: 'panel_count',
		},
		{
			name: 'Last Rotary Key (most recent encoder turn, 1-based)',
			variableId: 'last_rotary_key',
		},
		{
			name: 'Last Rotary Steps (+ up / - down)',
			variableId: 'last_rotary_steps',
		},
		{
			name: 'Last Rotary Panel (0 = master, 1-4 = expansion)',
			variableId: 'last_rotary_panel',
		},
	]
	// Per-key mute state and volume, decoded from the rendered key displays, for
	// every known panel. Empty string until the state is known (monitoring off, or
	// key not on the currently displayed shift page).
	for (const panelId of panels) {
		const prefix = variablePrefix(panelId)
		const label = panelLabel(panelId)
		defs.push({
			name: `${label}: Muted Keys (comma-separated key numbers)`,
			variableId: `${prefix}muted_keys`,
		})
		defs.push({ name: `${label}: Muted Key Count`, variableId: `${prefix}muted_count` })
		defs.push({
			name: `${label}: Key Volumes (key:percent, comma-separated)`,
			variableId: `${prefix}volume_levels`,
		})
		for (let key = 1; key <= 32; key++) {
			defs.push({
				name: `${label}: Key ${key} Muted (true/false)`,
				variableId: `${prefix}key_${key}_muted`,
			})
			// Volume comes from the same decoded frames. Empty for an unassigned key,
			// which draws no volume bar at all.
			defs.push({
				name: `${label}: Key ${key} Volume (0-100, empty if unassigned)`,
				variableId: `${prefix}key_${key}_volume`,
			})
		}
	}
	return defs
}

export function getDefaultVariableValues(): CompanionVariableValues {
	const values: CompanionVariableValues = {
		connection_status: 'Disconnected',
		media1_ip: 'Unknown',
		config1_ip: 'Unknown',
		media2_ip: 'Unknown',
		media1_mac_address: 'Unknown',
		config1_mac_address: 'Unknown',
		media2_mac_address: 'Unknown',
		expansion1_mac_address: 'Unknown',
		media1_link_status: 'Unknown',
		config1_link_status: 'Unknown',
		media2_link_status: 'Unknown',
		expansion1_link_status: 'Unknown',
		media1_speed: 'Unknown',
		media2_speed: 'Unknown',
		media1_external_port: 'Unknown',
		media2_external_port: 'Unknown',
		device_name: 'Unknown',
		firmware_version: 'Unknown',
		headset_a_connector_type: 'Unknown',
		headset_b_connector_type: 'Unknown',
		panel_type: 'Unknown',
		serial_number: 'Unknown',
		mac_address: 'Unknown',
		identify_enabled: 'Unknown',
		health_status: 'Unknown',
		alarm_count: '0',
		ptp_status: 'Unknown',
		ptp_master: 'Unknown',
		ptp_domain: 'Unknown',
		ptp_hybrid_mode: 'Unknown',
		ptp_receiver_only: 'Unknown',
		control_panel_enabled: 'Unknown',
		nmos_enabled: 'Unknown',
		nmos_status: 'Unknown',
		identify_status: 'Unknown',
		last_lever_key: '',
		last_lever_state: '',
		last_lever_panel: '',
		last_button_key: '',
		last_button_state: '',
		last_button_panel: '',
		mute_snapshot_slots: '',
		mute_snapshot_last: '',
		mute_snapshot_last_muted: '',
		mute_snapshot_last_size: '0',
		last_rotary_key: '',
		last_rotary_steps: '',
		last_rotary_panel: '',
		panels: '0',
		panel_count: '1',
	}
	for (const panelId of [0, 1, 2, 3, 4]) {
		const prefix = variablePrefix(panelId)
		values[`${prefix}muted_keys`] = ''
		values[`${prefix}muted_count`] = '0'
		values[`${prefix}volume_levels`] = ''
		for (let key = 1; key <= 32; key++) {
			values[`${prefix}key_${key}_muted`] = ''
			values[`${prefix}key_${key}_volume`] = ''
		}
	}
	return values
}
