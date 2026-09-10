import { Regex, type SomeCompanionConfigField } from '@companion-module/base'
import { PANEL_CHOICES } from './panels.js'

export interface DeviceConfig {
	bonjourHost?: string
	host?: string
	port?: number
	enableKeyEvents?: boolean
	enableMuteState?: boolean
	enableRotaryGang?: boolean
	gangSourcePanel?: number
	gangSourceKey?: number
	gangTargetPanel?: number
	gangTargetKeys?: string
}

export function getConfigFields(): SomeCompanionConfigField[] {
	return [
		{
			type: 'static-text',
			id: 'info',
			width: 12,
			label: 'Information',
			value: 'This module controls Riedel Smart Panels via WebSocket.',
		},
		{
			type: 'bonjour-device',
			id: 'bonjourHost',
			label: 'Device',
			width: 8,
		},
		{
			type: 'static-text',
			id: 'bonjourHost-filler',
			width: 8,
			label: '',
			value: '',
			isVisible: (options) => !!options['bonjourHost'],
		},
		{
			type: 'textinput',
			id: 'host',
			label: 'Panel IP Address',
			width: 8,
			default: '',
			regex: Regex.IP,
			isVisible: (options) => !options['bonjourHost'],
		},
		{
			type: 'number',
			id: 'port',
			label: 'WebSocket Port',
			width: 4,
			default: 80,
			min: 1,
			max: 65535,
			isVisible: (options) => !options['bonjourHost'],
		},
		// Both monitoring features are opt-in: they open a second connection to the
		// panel and (for mute state) decode display images, so they stay off unless
		// asked for. This also means upgrading an existing connection changes nothing.
		{
			type: 'checkbox',
			id: 'enableKeyEvents',
			label: 'Monitor key presses (opens a second /live-view connection)',
			width: 12,
			default: false,
		},
		{
			type: 'checkbox',
			id: 'enableMuteState',
			label: 'Monitor mute state and volume (decodes the key displays; needed for Set Key Mute)',
			width: 12,
			default: false,
			isVisible: (options) => options['enableKeyEvents'] === true,
		},
		// Ganged volume trim. Also opt-in: with it off the module never sends a rotary
		// step of its own, so an upgraded connection behaves exactly as before.
		{
			type: 'checkbox',
			id: 'enableRotaryGang',
			label: 'Gang one rotary to several keys (turning the source key trims them all together)',
			width: 12,
			default: false,
			isVisible: (options) => options['enableKeyEvents'] === true,
		},
		{
			type: 'dropdown',
			id: 'gangSourcePanel',
			label: 'Gang: source panel',
			width: 6,
			default: 0,
			choices: PANEL_CHOICES,
			isVisible: (options) => options['enableKeyEvents'] === true && options['enableRotaryGang'] === true,
		},
		{
			type: 'number',
			id: 'gangSourceKey',
			label: 'Gang: source key (its encoder drives the group)',
			width: 6,
			default: 1,
			min: 1,
			max: 32,
			isVisible: (options) => options['enableKeyEvents'] === true && options['enableRotaryGang'] === true,
		},
		{
			type: 'dropdown',
			id: 'gangTargetPanel',
			label: 'Gang: target panel',
			width: 6,
			default: 0,
			choices: PANEL_CHOICES,
			isVisible: (options) => options['enableKeyEvents'] === true && options['enableRotaryGang'] === true,
		},
		{
			type: 'textinput',
			id: 'gangTargetKeys',
			label: 'Gang: target keys (e.g. 1-8 or 1,3,5-7)',
			width: 6,
			default: '1-8',
			isVisible: (options) => options['enableKeyEvents'] === true && options['enableRotaryGang'] === true,
		},
	]
}
