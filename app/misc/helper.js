import React from 'react';
import Helmet from 'react-helmet';

import G from 'app-globals';

// MISC
function isDev () {
	return process.env.NODE_ENV === 'development';
}
function isMobile () {
	return __IS_BROWSER__ && window.innerWidth < G.dimensions.desktop;
}

function getHelmet (title, description, _links = [], _metas = []) {
	const links = [
		..._links,
		// {
		// 	rel: 'apple-touch-icon',
		// 	sizes: '180x180',
		// 	href: require('images/logos/favicon/apple-touch-icon.png').toString()
		// },
		// {
		// 	rel: 'icon',
		// 	type: 'image/png',
		// 	sizes: '16x16',
		// 	href: require('images/logos/favicon/favicon-16.png').toString()
		// },
		// {
		// 	rel: 'icon',
		// 	type: 'image/png',
		// 	sizes: '32x32',
		// 	href: require('images/logos/favicon/favicon-32.png').toString()
		// },
		// {
		// 	rel: 'icon',
		// 	type: 'image/png',
		// 	sizes: '192x192',
		// 	href: require('images/logos/favicon/favicon-192.png').toString()
		// },
		// {
		// 	rel: 'icon',
		// 	type: 'image/png',
		// 	sizes: '512x512',
		// 	href: require('images/logos/favicon/favicon-512.png').toString()
		// }
	];
	const metas = [
		..._metas,
		{
			name: 'description',
			content: description
		}
	];

	return (
		<Helmet
			title={title}
			link={links}
			meta={metas}
		/>
	);
}


export default {
	misc: {
		isDev,
		isMobile,
		helmet: getHelmet
	}
};
