import fs from 'fs';
import path from 'path';

import express from 'express';
import bodyParser from 'body-parser';

import React from 'react';

import { renderToString } from 'react-dom/server';
import { match, RouterContext } from 'react-router'

import db from 'database';

import api from './api/api';
import routes from 'app/app/routes';
import DataWrapper from 'app/app/data-wrapper';

const server = express();

const source = process.env.NODE_SOURCE;
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
	if (isDev) saveDevJSON();

	if (process.env.NODE_SERVER_RENDERING) {
		server.get('*', (req, res) => {
			match({ routes: routes, location: req.url }, (err, redirect, props) => {
				if (err) {
					return res.status(500).send(err.message)
				} else if (redirect) {
					return res.redirect(redirect.pathname + redirect.search)
				} else if (!props) {
					res.status(404);
					res.render('index.ejs', { markup: 'Not found'});
					return;
				}

				getInitialData().then(data => {
					const markup = renderToString(<DataWrapper serverData={data}><RouterContext {...props} /></DataWrapper>);
					res.render('index.ejs', { markup });
				});
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
function saveDevJSON () {
	getInitialData()
		.then(_newData => {
			const path = 'app/dev-data.json';

			const newData = JSON.stringify(_newData, null, 4);
			const oldData = fs.readFileSync(path, 'utf8');

			// Checks if the data has changed. This is necessary since we cannot yet make webpack ignore certain files in the watching process
			if (oldData !== newData) {
				fs.writeFile(path, newData, 'utf8');
			}
		});
}
function getInitialData () {
	const arr = [1, 2, 3];
	const obj = {one: 1, two: 2, three: 3};

	const format1 = db.format('SELECT ? --- # --- #prop --- :UPDATE --- :AND --- :OR --- ? --- \\?', ['hej', arr, arr, obj, obj, obj, 'hej']);
	const format2 = db.format('SELECT \\? --- \\# --- \\#prop --- ? --- # --- ?', ['hej', ['hej', 'hej'], 'hej']);

	console.log(format1);
	console.log(format2);

	const format3 = db.format('SELECT ?? --- ## --- ##prop --- ::UPDATE --- ::AND --- ::OR --- ?? --- \\??', ['hej', arr, arr, obj, obj, obj, 'hej']);
	const format4 = db.format('SELECT \\?? --- \\## --- \\##prop --- ?? --- ## --- ??', ['hej', ['hej', 'hej'], 'hej']);

	console.log(format3);
	console.log(format4);

	return db.query('SELECT * FROM test');
}
