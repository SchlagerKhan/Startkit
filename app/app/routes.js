import React from 'react';
import {Route, IndexRoute} from 'react-router';

import App from './app';
import {Start, Page} from 'pages';

export default (
	<Route path='/' component={App}>
		<IndexRoute component={Start} />
		<Route path='page' component={Page} />
	</Route>
);
