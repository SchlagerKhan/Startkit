import React from 'react';
import {render} from 'react-dom';
import {Router, browserHistory} from 'react-router';

import DataWrapper from './app/data-wrapper';
import routes from './app/routes';

let serverData;
if (process.env.NODE_IS_DEV) {
	 serverData = require('./dev-data.json'); // eslint-disable-line
}

render(
	(
		<DataWrapper serverData={serverData}>
			<Router routes={routes} history={browserHistory}/>
		</DataWrapper>
	),
	document.getElementById('root')
);
