import path from 'path';

import express from 'express';
import React from 'react';

import { renderToString } from 'react-dom/server';
import { match, RouterContext } from 'react-router'

import db from 'database';

import api from './api/api';
import routes from 'app/routes';

const server = express();

const source = process.env.NODE_SOURCE;
const isDev = process.env.NODE_ENV !== 'production';
const port = process.env.NODE_PORT || 7000;

db.connectFromSource().then(initServer);


function initServer () {
	const staticPath = (isDev ? 'build' : 'dist') + '/static';
	server.set('views', path.resolve(`./${staticPath}`));

	server.use('/static', express.static(staticPath));
	server.use('/api', api);


	if (process.env.NODE_SERVER_RENDERING) { // TODO: Pass variables to the server rendering
		server.get('*', (req, res) => {
			match({ routes: routes, location: req.url }, (err, redirect, props) => {
				if (err) {
					return res.status(500).send(err.message)
				} else if (redirect) {
					return res.redirect(redirect.pathname + redirect.search)
				}

				let markup = '';
				if (props) {
					markup = renderToString(<RouterContext {...props}/>);
				} else {
					markup = 'Not found';
					res.status(404);
				}

				db.query('SELECT * FROM test')
					.then(rows => {
						res.render('index.ejs', { markup, data: {rows} });
					})
			});
		});
	} else {
		server.get('*', (req, res) => {
			res.render('index.ejs')
		});
	}

	server.listen(port, (err) => {
		if (err) console.log(err);

		console.info('==> 🌎 Listenings on port %s', port);
	});
}
