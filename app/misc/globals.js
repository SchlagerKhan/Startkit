const isProductionSource = process.env.NODE_SOURCE === 'production';

export default {
	GOOGLE_ANALYTICS_KEY: isProductionSource ? 'XXX-1' : 'XXX-2',
	dimensions: {
		mobile: {
			min: 320,
			max: 420
		},
		desktop: 1024
	}
};
