import Promise from 'bluebird';
import xor from 'base64-xor';

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

import Test from 'server-models/test';

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

			const { location, params } = props;

			getInitialData(location, params).then(data => {
				const encryptedData = xor.encode('SECRET', JSON.stringify(data));

				const markup = renderToString(
					<DataWrapper serverData={data}>
						<RouterContext {...props} />
					</DataWrapper>
				);

				res.render('index.ejs', { markup, insertData: JSON.stringify(encryptedData) });
			});
		});
	});

	server.listen(port, (err) => {
		if (err) console.log(err);

		console.info('==> 🌎 Listenings on port %s', port);
	});
}
function saveDevJSON () {
	getInitialDevData()
		.then(_newData => {
			const path = 'app/dev-data.json';

			const newData = JSON.stringify(_newData, null, 4);
			const oldData = fs.readFileSync(path, 'utf8');

			if (oldData !== newData) {
				fs.writeFile(path, newData, 'utf8');
			}
		});
}
function getInitialDevData () {
	return Promise.all([
		Test.getTestData()
	]).then(data => {
		return {
			testData: data[0]
		}
	});
}

function getInitialData (location, params) {
	return Test.getTestData();
}
