/**
 * Minimal XML-RPC client for Riedel RRCS (Artist gateway).
 *
 * RRCS is the control interface to the Artist frame the panel is connected to.
 * It matters here for one reason: it addresses keys by PAGE, so it can reach a
 * key on a shift page the panel is not currently displaying - something the
 * panel's own /live-view API cannot do at all.
 *
 * Deliberately hand-rolled rather than pulling in an xml-rpc dependency: we send
 * exactly one method and only need the error code back, so a library would be
 * far more surface area than the problem warrants.
 */

import { request } from 'http'

/** RRCS echoes this back untouched; it is a transaction id, not authentication. */
const TRANS_KEY = 'C0123456789'

/** PressKeyEx "Trigger" selects which physical actuator to simulate. */
export const TRIGGER_LEVER_TALK = 1
export const TRIGGER_ENCODER_MUTE = 2

export interface RrcsTarget {
	host: string
	port: number
}

type RrcsParam = string | number | boolean

function encodeParam(value: RrcsParam): string {
	if (typeof value === 'boolean') return `<value><boolean>${value ? 1 : 0}</boolean></value>`
	if (typeof value === 'number') return `<value><i4>${Math.round(value)}</i4></value>`
	return `<value><string>${String(value).replace(/[<&]/g, (c) => (c === '<' ? '&lt;' : '&amp;'))}</string></value>`
}

function buildCall(method: string, params: RrcsParam[]): string {
	const body = params.map((p) => `<param>${encodeParam(p)}</param>`).join('')
	return `<?xml version="1.0" encoding="UTF-8"?><methodCall><methodName>${method}</methodName><params>${body}</params></methodCall>`
}

/**
 * RRCS replies `[TransKey, ErrorCode]` for the calls we make. We only need the
 * error code, so pull the first integer rather than fully parsing XML. A
 * <fault> is surfaced as an error instead - that is how RRCS reports an unknown
 * method or a bad argument count.
 */
function parseErrorCode(xml: string): number {
	if (/<fault>/i.test(xml)) {
		const message = /<string>([^<]*)<\/string>/i.exec(xml)?.[1] ?? 'unknown fault'
		throw new Error(`RRCS fault: ${message}`)
	}
	const match = /<(?:i4|int)>(-?\d+)<\/(?:i4|int)>/i.exec(xml)
	return match ? parseInt(match[1], 10) : 0
}

// Node's http rather than fetch: this module supports Node >=18, where fetch is
// still flagged experimental.
async function call(target: RrcsTarget, method: string, params: RrcsParam[], timeoutMs = 5000): Promise<number> {
	const payload = buildCall(method, params)
	return new Promise<number>((resolve, reject) => {
		const req = request(
			{
				host: target.host,
				port: target.port,
				path: '/RPC2',
				method: 'POST',
				// RRCS rejects any request without a User-Agent:
				// "HTTP/1.1 400 XML-RPC-Request requires user-agent."
				headers: {
					'Content-Type': 'text/xml',
					'Content-Length': Buffer.byteLength(payload),
					'User-Agent': 'companion-module-riedel-smartpanel',
				},
				timeout: timeoutMs,
			},
			(res) => {
				let body = ''
				res.setEncoding('utf8')
				res.on('data', (chunk) => (body += chunk))
				res.on('end', () => {
					if (res.statusCode && res.statusCode >= 400) {
						reject(new Error(`HTTP ${res.statusCode}`))
						return
					}
					try {
						resolve(parseErrorCode(body))
					} catch (error) {
						reject(error instanceof Error ? error : new Error(String(error)))
					}
				})
			},
		)
		req.on('timeout', () => req.destroy(new Error(`RRCS request timed out after ${timeoutMs}ms`)))
		req.on('error', reject)
		req.write(payload)
		req.end()
	})
}

/**
 * Simulate one momentary actuation of a key, through Artist.
 *
 * PressKeyEx(TransKey, Node, Port, IsInput, Page, ExpansionPanel, KeyNumber,
 *            IsVirtKey, Press, Trigger, PoolPort)
 *
 * Press and release are separate calls, mirroring the panel's own momentary
 * gesture. The release is sent even if the press throws, so a key is never left
 * held down.
 */
export async function pressKeyMomentary(
	target: RrcsTarget,
	opts: { node: number; port: number; page: number; expansionPanel: number; keyNumber: number; trigger: number },
): Promise<number> {
	const args = (press: boolean): RrcsParam[] => [
		TRANS_KEY,
		opts.node,
		opts.port,
		false, // IsInput
		opts.page,
		opts.expansionPanel,
		opts.keyNumber,
		false, // IsVirtKey
		press,
		opts.trigger,
		-1, // PoolPort
	]
	try {
		return await call(target, 'PressKeyEx', args(true))
	} finally {
		await call(target, 'PressKeyEx', args(false)).catch(() => undefined)
	}
}

/** Human-readable meaning for the RRCS error codes we are likely to hit. */
export function describeErrorCode(code: number): string {
	switch (code) {
		case 0:
			return 'ok'
		case 1:
			return 'invalid transaction key'
		case 2:
			return 'invalid net address (must be 1)'
		case 3:
			return 'invalid node address'
		case 4:
			return 'invalid port address'
		case 5:
			return 'invalid slot address'
		default:
			return `error code ${code}`
	}
}
