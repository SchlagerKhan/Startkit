import React from 'react';
import {Route, IndexRoute} from 'react-router';

import App from './app';
import {Main, Page} from 'containers';

export default (
	<Route path='/' component={App}>
		<IndexRoute component={Main} />
		<Route path='page' component={Page}/>
	</Route>
);
