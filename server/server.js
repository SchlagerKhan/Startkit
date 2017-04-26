import xor from 'base64-xor';

import fs from 'fs';
import path from 'path';

import express from 'express';
import bodyParser from 'body-parser';
import APIHelper from 'server-api-helper';

import React from 'react';

import { renderToString } from 'react-dom/server';
import { match, RouterContext } from 'react-router';
import Helmet from 'react-helmet';

import db from 'database';

import api from './api/api';
import routes from 'app/app/routes';
import DataWrapper from 'app/app/data-wrapper';

import Model from 'server-models/model';

const app = express();

const source = process.env.NODE_SOURCE; // eslint-disable-line
const isDev = process.env.NODE_IS_DEV;
const port = process.env.NODE_PORT;

// BODY PARSER
// ===========================================================================
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(APIHelper.validator());

// RESPONSE
// ===========================================================================
const staticPath = (isDev ? 'build' : 'dist') + '/static';
app.set('views', path.resolve(`./${staticPath}`));

app.use('/static', express.static(staticPath));
app.use('/api', api);

// SERVER INIT
// ===========================================================================
db.connect().then(initServer);


function initServer () {
	if (isDev) saveDevJSON();

	app.get('*', (req, res) => {
		match({ routes: routes, location: req.url }, (err, redirect, props) => {
			if (err) {
				res.status(500).send(err.message);
				return;
			} else if (redirect) {
				res.redirect(redirect.pathname + redirect.search);
				return;
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


				res.render('index.ejs', {
					...getMetaTags(),

					markup,
					insertData: JSON.stringify(encryptedData),

					delimiter: '?'
				});
			});
		});
	});

	app.listen(port, (err) => {
		if (err) console.log(err);

		console.info('==> 🌎 Listenings on port %s', port);
	});
}
function getMetaTags () {
	const { title, meta, link } = Helmet.renderStatic();


	return {
		title: title.toString() || 'Page title',
		meta: meta.toString() || 'Meta description',
		link: link.toString() || ''
	};
}

function saveDevJSON () {
	getInitialDevData()
		.then(_newData => {
			const devDataPath = 'app/dev-data.json';

			const newData = JSON.stringify(_newData, null, 4);
			const oldData = fs.readFileSync(devDataPath, 'utf8');

			if (oldData !== newData) {
				fs.writeFile(devDataPath, newData, 'utf8');
			}
		});
}
function getInitialDevData () {
	return Promise.all([
		Model.list()
	]).then(data => {
		return {
			testData: data[0]
		};
	});
}

function getInitialData (location, params) { // eslint-disable-line
	return Model.list();
}
