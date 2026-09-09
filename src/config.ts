import { Regex, type SomeCompanionConfigField } from '@companion-module/base'

export interface DeviceConfig {
	bonjourHost?: string
	host?: string
	port?: number
	enableKeyEvents?: boolean
	enableMuteState?: boolean
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
			label: 'Monitor mute state (decodes the key displays; needed for Set Key Mute)',
			width: 12,
			default: false,
			isVisible: (options) => options['enableKeyEvents'] === true,
		},
	]
}
