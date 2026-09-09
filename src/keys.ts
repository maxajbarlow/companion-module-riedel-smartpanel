/**
 * Parse a user-facing key specification into sorted 1-based key numbers.
 *
 * Accepts comma-separated single keys and ranges, e.g. "1-8" or "1,3,5-7".
 * Anything outside 1-32 is dropped, so a typo narrows the set rather than
 * actuating a key the panel does not have.
 */
export function parseKeySpec(spec: string): number[] {
	const out = new Set<number>()
	for (const part of spec.split(',')) {
		const token = part.trim()
		if (!token) continue
		const range = /^(\d+)\s*-\s*(\d+)$/.exec(token)
		if (range) {
			const a = parseInt(range[1], 10)
			const b = parseInt(range[2], 10)
			if (!isNaN(a) && !isNaN(b)) {
				for (let key = Math.min(a, b); key <= Math.max(a, b); key++) out.add(key)
			}
		} else {
			const n = parseInt(token, 10)
			if (!isNaN(n)) out.add(n)
		}
	}
	return [...out].filter((key) => key >= 1 && key <= 32).sort((a, b) => a - b)
}
