import { Regex, CompanionActionDefinitions } from '@companion-module/base'
import type { RiedelRSP1232HLInstance } from './main.js'
import { parseKeySpec } from './keys.js'
import { PANEL_CHOICES } from './panels.js'
import { pressKeyMomentary, describeErrorCode, TRIGGER_ENCODER_MUTE } from './rrcs.js'

export function getActions(instance: RiedelRSP1232HLInstance): CompanionActionDefinitions {
	return {
		// Network Actions
		setIpAddress: {
			name: 'Set IP Address',
			description: 'Configure IP address for a network interface',
			options: [
				{
					type: 'dropdown',
					label: 'Interface',
					id: 'interface',
					default: 'Media1',
					choices: [
						{ id: 'Config1', label: 'Config1' },
						{ id: 'Media1', label: 'Media1' },
						{ id: 'Media2', label: 'Media2' },
					],
				},
				{
					type: 'checkbox',
					label: 'Enable DHCP',
					id: 'dhcp',
					default: false,
				},
				{
					type: 'textinput',
					label: 'IP Address',
					id: 'ipAddress',
					default: '10.46.70.52',
					regex: Regex.IP,
					useVariables: true,
					isVisible: (options) => !options['dhcp'],
				},
				{
					type: 'textinput',
					label: 'Subnet Mask',
					id: 'subnetMask',
					default: '255.255.255.0',
					regex: Regex.IP,
					useVariables: true,
					isVisible: (options) => !options['dhcp'],
				},
				{
					type: 'textinput',
					label: 'Gateway',
					id: 'gateway',
					default: '10.46.70.1',
					regex: Regex.IP,
					useVariables: true,
					isVisible: (options) => !options['dhcp'],
				},
				{
					type: 'number',
					label: 'Prefix Length',
					id: 'prefixLength',
					default: 24,
					min: 0,
					max: 32,
					isVisible: (options) => !options['dhcp'],
				},
			],
			callback: async (action, context) => {
				const interfaceId = action.options.interface as string
				const ipAddress = await context.parseVariablesInString(action.options.ipAddress as string)
				const subnetMask = await context.parseVariablesInString(action.options.subnetMask as string)
				const gateway = await context.parseVariablesInString(action.options.gateway as string)
				const prefixLength = action.options.prefixLength as number // numbers don't currently support variables
				const dhcp = action.options.dhcp as boolean
				await instance.setIpAddress(interfaceId, ipAddress, subnetMask, gateway, prefixLength, dhcp)
			},
		},
		fetchNetworkStatus: {
			name: 'Fetch Network Status',
			description: 'Get current network status for an interface',
			options: [
				{
					type: 'dropdown',
					label: 'Interface',
					id: 'interface',
					default: 'Media1',
					choices: [
						{ id: 'Config1', label: 'Config1' },
						{ id: 'Media1', label: 'Media1' },
						{ id: 'Media2', label: 'Media2' },
					],
				},
			],
			callback: async (action) => {
				const interfaceId = action.options.interface as string
				instance.fetchNetworkStatus(interfaceId)
				instance.fetchNetworkLinkStatus(interfaceId)
			},
		},
		fetchAllNetworkStatus: {
			name: 'Fetch All Network Status',
			description: 'Refresh network status for all interfaces',
			options: [],
			callback: async () => {
				instance.fetchNetworkStatus('Media1')
				instance.fetchNetworkStatus('Config1')
				instance.fetchNetworkStatus('Media2')
				instance.fetchNetworkStatus('Expansion1')
				instance.fetchNetworkLinkStatus('Media1')
				instance.fetchNetworkLinkStatus('Config1')
				instance.fetchNetworkLinkStatus('Media2')
				instance.fetchNetworkLinkStatus('Expansion1')
				instance.fetchNetworkSettings()
				instance.fetchMediaPortAssignment()
			},
		},

		// Device Actions
		rebootDevice: {
			name: 'Reboot Device',
			description: 'Restart the panel (use with caution)',
			options: [
				{
					type: 'checkbox',
					label: 'Confirm reboot',
					id: 'confirm',
					default: false,
				},
			],
			callback: async (action) => {
				if (action.options.confirm) {
					instance.rebootDevice()
				} else {
					instance.log('warn', 'Reboot not confirmed - check the confirm checkbox to execute')
				}
			},
		},
		fetchDeviceInfo: {
			name: 'Fetch Device Info',
			description: 'Retrieve device information and firmware version',
			options: [],
			callback: async () => {
				instance.fetchDeviceInfo()
				instance.fetchDeviceSettings()
				instance.fetchFirmwareVersion()
				instance.fetchIdentifyStatus()
			},
		},

		// Artist Actions
		fetchArtistInfo: {
			name: 'Fetch Artist Info',
			description: 'Retrieve Artist information',
			options: [],
			callback: async () => {
				instance.fetchIntercomArtistName()
				instance.fetchIntercomArtistConnectionStatus()
			},
		},

		// Health & Alarm Actions
		fetchHealthStatus: {
			name: 'Fetch Health Status',
			description: 'Get current device health status',
			options: [],
			callback: async () => {
				instance.fetchHealthStatus()
			},
		},
		fetchAlarmList: {
			name: 'Fetch Alarm List',
			description: 'Get list of active alarms',
			options: [],
			callback: async () => {
				instance.fetchAlarmList()
			},
		},
		fetchAlarmHistory: {
			name: 'Fetch Alarm History',
			description: 'Get alarm history',
			options: [],
			callback: async () => {
				instance.fetchAlarmHistory()
			},
		},
		refreshAllStatus: {
			name: 'Refresh All Status',
			description: 'Fetch all status information (health, alarms, PTP, network)',
			options: [],
			callback: async () => {
				instance.fetchHealthStatus()
				instance.fetchAlarmList()
				instance.fetchPtpStatus()
				instance.fetchPtpSettings()
				instance.fetchNetworkStatus('Media1')
				instance.fetchNetworkStatus('Config1')
				instance.fetchNetworkStatus('Media2')
				instance.fetchNetworkStatus('Expansion1')
				instance.fetchNetworkLinkStatus('Media1')
				instance.fetchNetworkLinkStatus('Config1')
				instance.fetchNetworkLinkStatus('Media2')
				instance.fetchNetworkLinkStatus('Expansion1')
				instance.fetchNetworkSettings()
				instance.fetchMediaPortAssignment()
				instance.fetchDeviceInfo()
				instance.fetchDeviceSettings()
				instance.fetchFirmwareVersion()
				instance.fetchIdentifyStatus()
				instance.fetchIntercomArtistName()
				instance.fetchIntercomArtistConnectionStatus()
			},
		},

		// PTP Actions
		fetchPtpStatus: {
			name: 'Fetch PTP Status',
			description: 'Get PTP synchronization status',
			options: [],
			callback: async () => {
				instance.fetchPtpStatus()
			},
		},
		fetchPtpSettings: {
			name: 'Fetch PTP Settings',
			description: 'Get current PTP configuration',
			options: [],
			callback: async () => {
				instance.fetchPtpSettings()
			},
		},
		updatePtpSettings: {
			name: 'Update PTP Settings',
			description: 'Configure PTP domain and mode settings',
			options: [
				{
					type: 'number',
					label: 'PTP Domain',
					id: 'domain',
					default: 0,
					min: 0,
					max: 255,
				},
				{
					type: 'checkbox',
					label: 'Hybrid Mode',
					id: 'hybridMode',
					default: true,
				},
				{
					type: 'checkbox',
					label: 'Time Receiver Only',
					id: 'timeReceiverOnly',
					default: true,
				},
			],
			callback: async (action) => {
				const domain = action.options.domain as number
				const hybridMode = action.options.hybridMode as boolean
				const timeReceiverOnly = action.options.timeReceiverOnly as boolean
				instance.updatePtpSettings(domain, hybridMode, timeReceiverOnly)
			},
		},
		setPtpDomain: {
			name: 'Set PTP Domain',
			description: 'Change PTP domain only (keeps other settings)',
			options: [
				{
					type: 'number',
					label: 'PTP Domain',
					id: 'domain',
					default: 0,
					min: 0,
					max: 255,
				},
			],
			callback: async (action) => {
				instance.updatePtpSettings(action.options.domain as number, instance.ptpHybridMode, instance.ptpReceiverOnly)
			},
		},

		// Control Panel Actions
		enableControlPanel: {
			name: 'Enable Control Panel',
			description: 'Enable the control panel application',
			options: [],
			callback: async () => {
				instance.enableControlPanel()
			},
		},
		disableControlPanel: {
			name: 'Disable Control Panel',
			description: 'Disable the control panel application',
			options: [],
			callback: async () => {
				instance.disableControlPanel()
			},
		},
		toggleControlPanel: {
			name: 'Toggle Control Panel',
			description: 'Toggle control panel enabled/disabled state',
			options: [],
			callback: async () => {
				instance.toggleControlPanel()
			},
		},

		// NMOS Actions
		enableNmos: {
			name: 'Enable NMOS',
			description: 'Enable NMOS functionality',
			options: [],
			callback: async () => {
				instance.enableNmos()
			},
		},
		disableNmos: {
			name: 'Disable NMOS',
			description: 'Disable NMOS functionality',
			options: [],
			callback: async () => {
				instance.disableNmos()
			},
		},
		toggleNmos: {
			name: 'Toggle NMOS',
			description: 'Toggle NMOS enabled/disabled state',
			options: [],
			callback: async () => {
				instance.toggleNmos()
			},
		},
		fetchNmosStatus: {
			name: 'Fetch NMOS Status',
			description: 'Get current NMOS status',
			options: [],
			callback: async () => {
				instance.fetchNmosStatus()
			},
		},

		// Identify Actions
		enableIdentify: {
			name: 'Enable Identify',
			description: 'Turn on the panel identify LEDs (locate the physical panel)',
			options: [],
			callback: async () => {
				instance.enableIdentify()
			},
		},
		disableIdentify: {
			name: 'Disable Identify',
			description: 'Turn off the panel identify LEDs (also stops an in-progress flash)',
			options: [],
			callback: async () => {
				instance.disableIdentify()
			},
		},
		toggleIdentify: {
			name: 'Toggle Identify',
			description: 'Toggle the panel identify LEDs on/off',
			options: [],
			callback: async () => {
				instance.toggleIdentify()
			},
		},
		flashIdentify: {
			name: 'Flash Identify',
			description:
				'Show an exact number of identify blinks, then turn identify off. The blink rate (~1.7/s) is fixed by the panel itself; the module counts the blinks live and stops after the requested number.',
			options: [
				{
					type: 'number',
					label: 'Number of Flashes',
					id: 'count',
					default: 3,
					min: 1,
					max: 20,
				},
			],
			callback: async (action) => {
				const count = action.options.count as number
				await instance.flashIdentify(count)
			},
		},

		// Identify-by-IP Actions (target an arbitrary panel without a dedicated connection)
		enableIdentifyAtIp: {
			name: 'Enable Identify (Custom IP)',
			description:
				'Turn on identify LEDs on a panel at a specific IP - supports variables, no dedicated connection needed',
			options: [
				{
					type: 'textinput',
					label: 'Panel IP Address',
					id: 'ip',
					default: '',
					useVariables: true,
				},
			],
			callback: async (action) => {
				const ip = action.options.ip as string
				if (!ip) {
					instance.log('warn', 'Enable Identify (Custom IP): no IP address provided')
					return
				}
				await instance.enableIdentifyAtIp(ip)
			},
		},
		disableIdentifyAtIp: {
			name: 'Disable Identify (Custom IP)',
			description:
				'Turn off identify LEDs on a panel at a specific IP (also stops an in-progress flash) - supports variables, no dedicated connection needed',
			options: [
				{
					type: 'textinput',
					label: 'Panel IP Address',
					id: 'ip',
					default: '',
					useVariables: true,
				},
			],
			callback: async (action) => {
				const ip = action.options.ip as string
				if (!ip) {
					instance.log('warn', 'Disable Identify (Custom IP): no IP address provided')
					return
				}
				await instance.disableIdentifyAtIp(ip)
			},
		},
		flashIdentifyAtIp: {
			name: 'Flash Identify (Custom IP)',
			description:
				'Show an exact number of identify blinks on a panel at a specific IP, then turn identify off. The blink rate (~1.7/s) is fixed by the panel itself; the module counts the blinks live and stops after the requested number. Supports variables, no dedicated connection needed.',
			options: [
				{
					type: 'textinput',
					label: 'Panel IP Address',
					id: 'ip',
					default: '',
					useVariables: true,
				},
				{
					type: 'number',
					label: 'Number of Flashes',
					id: 'count',
					default: 3,
					min: 1,
					max: 20,
				},
			],
			callback: async (action) => {
				const ip = action.options.ip as string
				if (!ip) {
					instance.log('warn', 'Flash Identify (Custom IP): no IP address provided')
					return
				}
				const count = action.options.count as number
				await instance.flashIdentifyAtIp(ip, count)
			},
		},

		// Key Actions (Mute / Rotary Push)
		toggleKeyMute: {
			name: 'Toggle Mute on Key',
			description:
				'Toggle mute on a key by simulating a rotary encoder push on the connected panel or an expansion panel',
			options: [
				{
					type: 'dropdown',
					label: 'Panel',
					id: 'panelId',
					default: 0,
					choices: [
						{ id: 0, label: 'Master Panel (Panel 0)' },
						{ id: 1, label: 'Expansion Panel 1 (Panel 1)' },
						{ id: 2, label: 'Expansion Panel 2 (Panel 2)' },
						{ id: 3, label: 'Expansion Panel 3 (Panel 3)' },
						{ id: 4, label: 'Expansion Panel 4 (Panel 4)' },
					],
				},
				{
					type: 'textinput',
					label: 'Key Number (1 - 32)',
					id: 'keyNumber',
					default: '1',
					useVariables: true,
				},
				{
					type: 'number',
					label: 'Press Hold Duration (ms)',
					id: 'durationMs',
					default: 250,
					min: 200,
					max: 2000,
				},
			],
			callback: async (action, context) => {
				const panelId = Number(action.options.panelId ?? 0)
				let keyNumber = 1
				if (action.options.keyNumber !== undefined) {
					const parsed = await context.parseVariablesInString(String(action.options.keyNumber))
					keyNumber = parseInt(parsed, 10) || 1
				}
				const durationMs = Number(action.options.durationMs ?? 250)
				await instance.toggleKeyMute(panelId, keyNumber, durationMs)
			},
		},
		toggleKeyMuteAtIp: {
			name: 'Toggle Mute on Key (Custom IP)',
			description:
				'Toggle mute on a key by simulating a rotary encoder push on a panel at a specific IP - supports variables',
			options: [
				{
					type: 'textinput',
					label: 'Panel IP Address',
					id: 'ip',
					default: '',
					useVariables: true,
				},
				{
					type: 'dropdown',
					label: 'Panel',
					id: 'panelId',
					default: 0,
					choices: [
						{ id: 0, label: 'Master Panel (Panel 0)' },
						{ id: 1, label: 'Expansion Panel 1 (Panel 1)' },
						{ id: 2, label: 'Expansion Panel 2 (Panel 2)' },
						{ id: 3, label: 'Expansion Panel 3 (Panel 3)' },
						{ id: 4, label: 'Expansion Panel 4 (Panel 4)' },
					],
				},
				{
					type: 'textinput',
					label: 'Key Number (1 - 32)',
					id: 'keyNumber',
					default: '1',
					useVariables: true,
				},
				{
					type: 'number',
					label: 'Press Hold Duration (ms)',
					id: 'durationMs',
					default: 250,
					min: 200,
					max: 2000,
				},
			],
			callback: async (action, context) => {
				let ip = action.options.ip as string
				if (typeof ip === 'string') {
					ip = await context.parseVariablesInString(ip)
				}
				if (!ip) {
					instance.log('warn', 'Toggle Mute on Key (Custom IP): no IP address provided')
					return
				}
				const panelId = Number(action.options.panelId ?? 0)
				let keyNumber = 1
				if (action.options.keyNumber !== undefined) {
					const parsed = await context.parseVariablesInString(String(action.options.keyNumber))
					keyNumber = parseInt(parsed, 10) || 1
				}
				const durationMs = Number(action.options.durationMs ?? 250)
				await instance.toggleKeyMuteAtIp(ip, panelId, keyNumber, durationMs)
			},
		},
		setKeyMute: {
			name: 'Set Key Mute (state-aware)',
			description:
				'Set a key muted or unmuted. Reads the real mute state from the panel and only actuates when it differs, so repeated presses are safe. Requires "Monitor mute state".',
			options: [
				{
					type: 'dropdown',
					label: 'Panel',
					id: 'panelId',
					default: 0,
					choices: PANEL_CHOICES,
				},
				{
					type: 'textinput',
					label: 'Key Number (1 - 32)',
					id: 'keyNumber',
					default: '1',
					useVariables: true,
				},
				{
					type: 'dropdown',
					label: 'Set to',
					id: 'state',
					default: 'on',
					choices: [
						{ id: 'on', label: 'Muted' },
						{ id: 'off', label: 'Unmuted' },
						{ id: 'toggle', label: 'Toggle (always actuate)' },
					],
				},
				{
					type: 'number',
					label: 'Press Hold Duration (ms)',
					id: 'durationMs',
					default: 250,
					min: 200,
					max: 2000,
				},
			],
			callback: async (action, context) => {
				const panelId = Number(action.options.panelId ?? 0)
				const parsed = await context.parseVariablesInString(String(action.options.keyNumber ?? '1'))
				const keyNumber = parseInt(parsed, 10) || 1
				const durationMs = Number(action.options.durationMs ?? 250)
				const want = String(action.options.state ?? 'on')
				if (want === 'toggle') {
					await instance.toggleKeyMute(panelId, keyNumber, durationMs)
					return
				}
				const desired = want === 'on'
				const current = instance.getKeyMuted(panelId, keyNumber)
				if (current === undefined) {
					instance.log(
						'warn',
						`Set Key Mute: mute state for panel ${panelId} key ${keyNumber} is unknown - enable "Monitor mute state" and make sure the key is on the displayed shift page. Not actuating.`,
					)
					return
				}
				if (current === desired) {
					instance.log(
						'debug',
						`Set Key Mute: panel ${panelId} key ${keyNumber} already ${desired ? 'muted' : 'unmuted'}`,
					)
					return
				}
				await instance.toggleKeyMute(panelId, keyNumber, durationMs)
			},
		},
		setKeyMuteMultiple: {
			name: 'Set Mute on Multiple Keys (state-aware)',
			description:
				'Mute or unmute a set of keys in one action, e.g. "1-8" or "1,3,5-7". Only keys whose state differs are actuated, so this is safe to repeat - ideal for a focus-mute shortcut. Requires "Monitor mute state".',
			options: [
				{
					type: 'dropdown',
					label: 'Panel',
					id: 'panelId',
					default: 0,
					choices: PANEL_CHOICES,
				},
				{
					type: 'textinput',
					label: 'Keys (e.g. 1-8 or 1,3,5-7)',
					id: 'keys',
					default: '1-8',
					useVariables: true,
				},
				{
					type: 'dropdown',
					label: 'Set to',
					id: 'state',
					default: 'on',
					choices: [
						{ id: 'on', label: 'Muted' },
						{ id: 'off', label: 'Unmuted' },
					],
				},
				{
					type: 'number',
					label: 'Press Hold Duration (ms)',
					id: 'durationMs',
					default: 250,
					min: 200,
					max: 2000,
				},
			],
			callback: async (action, context) => {
				const panelId = Number(action.options.panelId ?? 0)
				const spec = await context.parseVariablesInString(String(action.options.keys ?? ''))
				const keys = parseKeySpec(spec)
				if (keys.length === 0) {
					instance.log('warn', `Set Mute on Multiple Keys: no valid keys in "${spec}"`)
					return
				}
				const desired = String(action.options.state ?? 'on') === 'on'
				const durationMs = Number(action.options.durationMs ?? 250)
				// Work out the whole set first, then actuate it in a single batch so the
				// keys change together instead of cascading one at a time.
				const changed: number[] = []
				const unknown: number[] = []
				for (const key of keys) {
					const current = instance.getKeyMuted(panelId, key)
					if (current === undefined) {
						unknown.push(key)
						continue
					}
					if (current === desired) continue
					changed.push(key)
				}
				if (changed.length > 0) {
					await instance.toggleKeyMutes(panelId, changed, durationMs)
				}
				if (unknown.length > 0) {
					instance.log(
						'warn',
						`Set Mute on Multiple Keys: state unknown for key(s) ${unknown.join(',')} - not actuated (enable "Monitor mute state").`,
					)
				}
				instance.log(
					'info',
					`Set Mute on Multiple Keys: ${desired ? 'muted' : 'unmuted'} ${
						changed.length > 0 ? changed.join(',') : 'nothing (already in the requested state)'
					}`,
				)
			},
		},
		captureMuteState: {
			name: 'Capture Mute State (snapshot)',
			description:
				'Record which keys are currently muted so you can put them back later with Restore Mute State. Leave Keys empty to capture every key whose state is known. Requires "Monitor mute state".',
			options: [
				{
					type: 'dropdown',
					label: 'Panel',
					id: 'panelId',
					default: 0,
					choices: PANEL_CHOICES,
				},
				{
					type: 'textinput',
					label: 'Snapshot name',
					id: 'slot',
					default: 'default',
					useVariables: true,
				},
				{
					type: 'textinput',
					label: 'Keys to capture (empty = all, or e.g. 1-8)',
					id: 'keys',
					default: '',
					useVariables: true,
				},
			],
			callback: async (action, context) => {
				const slot =
					(await context.parseVariablesInString(String(action.options.slot ?? 'default'))).trim() || 'default'
				const panelId = Number(action.options.panelId ?? 0)
				const spec = await context.parseVariablesInString(String(action.options.keys ?? ''))
				const keys = spec.trim() ? parseKeySpec(spec) : null
				const { captured, unknown } = instance.captureMuteSnapshot(slot, panelId, keys)
				if (captured.length === 0) {
					instance.log(
						'warn',
						`Capture Mute State: nothing captured for "${slot}" - no key states are known yet. Enable "Monitor mute state" and check the keys are on the displayed shift page.`,
					)
					return
				}
				if (unknown.length > 0) {
					instance.log(
						'warn',
						`Capture Mute State: state unknown for key(s) ${unknown.join(',')} - not included in snapshot "${slot}".`,
					)
				}
				instance.log('info', `Capture Mute State: snapshot "${slot}" holds ${captured.length} key(s)`)
			},
		},
		restoreMuteState: {
			name: 'Restore Mute State (undo)',
			description:
				'Put every key in a snapshot back to the state it had when captured. Only keys that have since changed are actuated, so this is safe to press twice. Requires "Monitor mute state".',
			options: [
				{
					type: 'textinput',
					label: 'Snapshot name',
					id: 'slot',
					default: 'default',
					useVariables: true,
				},
				{
					type: 'number',
					label: 'Press Hold Duration (ms)',
					id: 'durationMs',
					default: 250,
					min: 200,
					max: 2000,
				},
			],
			callback: async (action, context) => {
				const slot =
					(await context.parseVariablesInString(String(action.options.slot ?? 'default'))).trim() || 'default'
				const durationMs = Number(action.options.durationMs ?? 250)
				const snapshot = instance.getMuteSnapshot(slot)
				if (!snapshot) {
					instance.log('warn', `Restore Mute State: no snapshot named "${slot}" - capture one first.`)
					return
				}
				// Collect every key that drifted from the snapshot, grouped by panel, then
				// put each panel's keys back in one batch so an undo lands at once rather
				// than key by key. A snapshot may span several panels.
				const restoreByPanel = new Map<number, number[]>()
				const unknown: string[] = []
				for (const [entry, wasMuted] of snapshot) {
					const [panelPart, keyPart] = entry.split(':')
					const panelId = Number(panelPart)
					const keyNumber = Number(keyPart)
					const current = instance.getKeyMuted(panelId, keyNumber)
					if (current === undefined) {
						unknown.push(entry)
						continue
					}
					if (current === wasMuted) continue
					const list = restoreByPanel.get(panelId) ?? []
					list.push(keyNumber)
					restoreByPanel.set(panelId, list)
				}
				for (const [panelId, keys] of restoreByPanel) {
					await instance.toggleKeyMutes(panelId, keys, durationMs)
				}
				if (unknown.length > 0) {
					instance.log('warn', `Restore Mute State: state unknown for ${unknown.join(',')} - not restored.`)
				}
				const summary = [...restoreByPanel.entries()]
					.map(([panelId, keys]) => `panel ${panelId}: ${keys.join(',')}`)
					.join(' | ')
				instance.log(
					'info',
					`Restore Mute State "${slot}": restored ${summary || 'nothing (already matches the snapshot)'}`,
				)
			},
		},
		clearMuteSnapshot: {
			name: 'Clear Mute Snapshot',
			description: 'Discard a stored mute snapshot.',
			options: [
				{
					type: 'textinput',
					label: 'Snapshot name',
					id: 'slot',
					default: 'default',
					useVariables: true,
				},
			],
			callback: async (action, context) => {
				const slot =
					(await context.parseVariablesInString(String(action.options.slot ?? 'default'))).trim() || 'default'
				const existed = instance.clearMuteSnapshot(slot)
				instance.log('info', `Clear Mute Snapshot: "${slot}" ${existed ? 'cleared' : 'did not exist'}`)
			},
		},

		discoverArtistAddress: {
			name: 'Discover Artist Address (RRCS)',
			description:
				"Look this panel up in Artist by name and save its Node/Port into this connection's config, so the RRCS actions know where to send. Runs automatically the first time if the address is blank; use this to re-run it after the panel is renamed or moved. Pulls the whole Artist port list, so it takes a few seconds - it is not something to put on a hot button.",
			options: [],
			callback: async () => {
				const result = await instance.discoverArtistAddress()
				instance.log(result.ok ? 'info' : 'warn', result.message)
			},
		},

		// --- Artist / RRCS: reaches pages the panel is not displaying ---
		// Deliberately named and described so it cannot be confused with the
		// state-aware actions above: this one CANNOT read state, so it toggles.
		rrcsToggleKeyMuteAnyPage: {
			name: 'Toggle Key Mute on ANY Page (via Artist/RRCS - blind toggle)',
			description:
				'Toggle mute on a key on ANY shift page, including pages the panel is not currently showing. Goes via the Artist system (RRCS), not the panel, so it needs the Artist section filled in under connection config. WARNING: this is a blind TOGGLE - Artist exposes no way to read mute state, so it flips whatever the key currently is. It cannot be made idempotent. For keys on the page the panel IS showing, prefer "Set Key Mute (state-aware)" instead.',
			options: [
				{
					type: 'number',
					label: 'Page (1 = first shift page)',
					id: 'page',
					default: 1,
					min: 1,
					max: 8,
				},
				{
					type: 'dropdown',
					label: 'Panel',
					id: 'expansionPanel',
					default: 0,
					choices: PANEL_CHOICES,
				},
				{
					type: 'textinput',
					label: 'Key Number (1 - 32)',
					id: 'keyNumber',
					default: '1',
					useVariables: true,
				},
			],
			callback: async (action, context) => {
				const host = String(instance.config.rrcsHost ?? '').trim()
				if (!host) {
					instance.log(
						'warn',
						'Toggle Key Mute on ANY Page: no RRCS host configured - see the Artist section in connection config',
					)
					return
				}
				const node = Number(instance.config.artistNode ?? 0)
				const port = Number(instance.config.artistPort ?? 0)
				if (!node && !port) {
					instance.log('warn', "Toggle Key Mute on ANY Page: this panel's Artist Node/Port are not set")
					return
				}
				const keyNumber = parseInt(await context.parseVariablesInString(String(action.options.keyNumber ?? '1')), 10)
				if (isNaN(keyNumber)) {
					instance.log('warn', 'Toggle Key Mute on ANY Page: invalid key number')
					return
				}
				const page = Number(action.options.page ?? 1)
				const expansionPanel = Number(action.options.expansionPanel ?? 0)
				try {
					const code = await pressKeyMomentary(
						{ host, port: Number(instance.config.rrcsPort ?? 8193) },
						{ node, port, page, expansionPanel, keyNumber, trigger: TRIGGER_ENCODER_MUTE },
					)
					if (code === 0) {
						instance.log(
							'info',
							`Toggle Key Mute on ANY Page: toggled page ${page} panel ${expansionPanel} key ${keyNumber}`,
						)
					} else {
						instance.log('warn', `Toggle Key Mute on ANY Page: RRCS returned ${describeErrorCode(code)}`)
					}
				} catch (error) {
					instance.log('error', `Toggle Key Mute on ANY Page failed: ${error}`)
				}
			},
		},

		// Volume (per-key rotary encoder)
		adjustKeyVolume: {
			name: 'Adjust Key Volume',
			description:
				'Turn a key\'s volume encoder by a number of detents. Positive turns up, negative turns down. Roughly 40 detents covers the full range. Relative only - the panel has no "set volume to X" command.',
			options: [
				{
					type: 'dropdown',
					label: 'Panel',
					id: 'panelId',
					default: 0,
					choices: PANEL_CHOICES,
				},
				{
					type: 'textinput',
					label: 'Key Number (1 - 32)',
					id: 'keyNumber',
					default: '1',
					useVariables: true,
				},
				{
					type: 'number',
					label: 'Steps (negative turns down)',
					id: 'steps',
					default: 1,
					min: -40,
					max: 40,
				},
			],
			callback: async (action, context) => {
				const panelId = Number(action.options.panelId ?? 0)
				const keyNumber = parseInt(await context.parseVariablesInString(String(action.options.keyNumber ?? '1')), 10)
				const steps = Number(action.options.steps ?? 1)
				if (isNaN(keyNumber)) {
					instance.log('warn', 'Adjust Key Volume: invalid key number')
					return
				}
				await instance.adjustKeyVolumes(panelId, [keyNumber], steps)
			},
		},
		adjustKeyVolumeMultiple: {
			name: 'Adjust Volume on Multiple Keys (ganged trim)',
			description:
				'Trim a whole group of keys by the same number of detents in one action, e.g. "1-8". Every key moves together, so the balance between them is preserved. Relative only.',
			options: [
				{
					type: 'dropdown',
					label: 'Panel',
					id: 'panelId',
					default: 0,
					choices: PANEL_CHOICES,
				},
				{
					type: 'textinput',
					label: 'Keys (e.g. 1-8 or 1,3,5-7)',
					id: 'keys',
					default: '1-8',
					useVariables: true,
				},
				{
					type: 'number',
					label: 'Steps (negative turns down)',
					id: 'steps',
					default: 1,
					min: -40,
					max: 40,
				},
			],
			callback: async (action, context) => {
				const panelId = Number(action.options.panelId ?? 0)
				const spec = await context.parseVariablesInString(String(action.options.keys ?? ''))
				const keys = parseKeySpec(spec)
				const steps = Number(action.options.steps ?? 1)
				if (keys.length === 0) {
					instance.log('warn', `Adjust Volume on Multiple Keys: no valid keys in "${spec}"`)
					return
				}
				await instance.adjustKeyVolumes(panelId, keys, steps)
				instance.log(
					'info',
					`Adjust Volume on Multiple Keys: ${steps > 0 ? '+' : ''}${steps} to key(s) ${keys.join(',')}`,
				)
			},
		},
	}
}
