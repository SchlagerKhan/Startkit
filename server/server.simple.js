import path from 'path';

import express from 'express';
import bodyParser from 'body-parser';

import db from 'database';

import api from './api/api';

const server = express();

const source = process.env.NODE_SOURCE; // eslint-disable-line
const isDev = process.env.NODE_IS_DEV;
const port = process.env.NODE_PORT;

// BODY PARSER
// =============================================================================
server.use(bodyParser.json());
server.use(bodyParser.urlencoded({extended: true}));

// RESPONSE
// =============================================================================
const staticPath = (isDev ? 'build' : 'dist') + '/static';
server.set('views', path.resolve(`./${staticPath}`));

server.use('/static', express.static(staticPath));
server.use('/api', api);

// SERVER INIT
// =============================================================================
db.connectFromSource().then(initServer);


function initServer () {
	server.get('*', (req, res) => res.send('index.html'));

	server.listen(port, (err) => {
		if (err) console.log(err);

		console.info('==> 🌎 Listenings on port %s', port);
	});
}
