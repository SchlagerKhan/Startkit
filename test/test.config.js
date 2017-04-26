expect.extend({
	toBeArray(received) {
		const pass = Array.isArray(received);

		return {
			pass,
			message: () => `expected ${received} ${pass ? 'not' : ''} to be an Array`,
		};
	},
	toBeObject(received) {
		const pass = typeof received === 'object' && !Array.isArray(received);

		return {
			pass,
			message: () => `expected ${received} ${pass ? 'not' : ''} to be an Array`,
		};
	},
});
