import {values, mapValues, startsWith} from 'lodash';
import mysql from 'promise-mysql';

export const MODES = {
	PRODUCTION: 'PRODUCTION',
	STAGE: 'STAGE',
	LOCAL: 'LOCAL',
};
export const NAMES = {
	PDOUCTION: 'main',
	STAGE: 'stage',
	LOCAL: 'test',
};

const state = {
	pool: {},
	primaryDatabase: null,
};

function DatabaseConnection(dbName, connection) {
	return {
		dbName,
		connection,
		escape: escape.bind(connection),
		escapeId: escapeId.bind(connection),
		query: query.bind(connection),
		format: format.bind(connection),
	};
}

function connectBySource() {
	const source = process.env.NODE_SOURCE;
	const env = process.env.NODE_ENV;

	if (source === 'production') {
		return connectByMode(MODES.PRODUCTION);
	} else if (source === 'stage') {
		return connectByMode(MODES.STAGE);
	} else if (source === 'local' || env === 'test') {
		return connectByMode(MODES.LOCAL);
	}

	throw new Error(`No such source: ${source}`);
}
function connectByMode(mode, dbName = NAMES[mode]) {
	let settings;

	switch (mode) {
		case MODES.PRODUCTION:
			settings = {
				host: 'localhost',
				user: '',
				password: '',
				database: dbName,
			};
			break;
		case MODES.STAGE:
			settings = {
				host: 'localhost',
				user: '',
				password: '',
				database: dbName,
			};
			break;
		case MODES.LOCAL:
			settings = {
				host: 'localhost',
				user: 'root',
				password: 'root',
				port: 8889, // Using MAMP
				database: dbName,
			};
			break;
	}

	if (!state.primaryDatabase) {
		setPrimaryDatabase(dbName);
	}

	return mysql.createConnection(settings).then(connection => {
		setConfig(connection);
		state.pool[dbName] = new DatabaseConnection(dbName, connection);
	});
}
function setConfig(connection) {
	// Double connection below since we use promise-mysql
	connection.connection.config.queryFormat = (queryText, dataValues) => {
		if (!dataValues) return queryText;

		let newQuery = queryText
			.replace(/\\\?\?/g, '|QQ|')
			.replace(/\\\?/g, '|Q|')
			.replace(/\\##/g, '|HH|')
			.replace(/\\#/g, '|H|')
			.replace(/\\\:/g, '|C|');

		const regex = /(\?\?|\?|#\w+|##|#|:AND|:OR|:)/g;

		let vIndex = 0;
		newQuery = newQuery.replace(regex, iterateReplacement);

		newQuery = newQuery
			.replace(/\|Q\|/g, '?')
			.replace(/\|H\|/g, '#')
			.replace(/\|QQ\|/g, '??')
			.replace(/\|HH\|/g, '##')
			.replace(/\|C\|/g, ':');

		return newQuery;

		function iterateReplacement(match) {
			const value = dataValues[vIndex];

			if (value === undefined) {
				throw new Error(
					`Value at index ${vIndex} is undefined: ${match}, ${value}, ${queryText}`
				);
			}

			let safeType;
			if (startsWith(match, ':')) safeType = 'object';
			else if (startsWith(match, '#')) safeType = 'array';

			if (!safeQuery(value, safeType)) {
				throw new Error(
					`Faulty query-value pair (index: ${vIndex}): ${match}, ${JSON.stringify(value)} (${typeof value} | supposed to be: ${safeType}), ${queryText}`
				);
			}

			vIndex++;

			return getQueryReplacement(match, value);
		}
	};

	function getQueryReplacement(match, value) {
		let insertStr;
		switch (match) {
			case ':':
				insertStr = mapProps(value).join(',');
				break;
			case ':AND':
				insertStr = mapProps(value).join(' AND ');
				break;
			case ':OR':
				insertStr = mapProps(value).join(' OR ');
				break;
			case '##':
				insertStr = value.map(val => escapeId(val)).join(',');
				break;
			case '#':
				insertStr = value.map(val => escape(val)).join(',');
				break;
			case '??':
				insertStr = escapeId(value);
				break;
			case '?':
				insertStr = escape(value);
				break;
			default:
				// #{prop}
				if (startsWith(match, '#')) {
					const prop = match.replace('#', '').trim();
					insertStr = value
						.map(val => `${escapeId(prop)}=${escape(val)}`)
						.join(',');
				} else {
					throw Error(`No such query replacement: ${match}`);
				}
				break;
		}

		return insertStr;
	}
	function mapProps(dataValues) {
		return values(
			mapValues(dataValues, (value, key) => `${escapeId(key)}=${escape(value)}`)
		);
	}
	function safeQuery(value, type) {
		if (type === 'array' && !Array.isArray(value)) return false;
		if (type === 'object' && !(typeof value === 'object' && value !== null)) {
			return false;
		}
		if (
			!type &&
			(value !== null && ['string', 'number'].indexOf(typeof value) === -1)
		) {
			return false;
		}

		return true;
	}
}

function setPrimaryDatabase(dbName) {
	state.primaryDatabase = dbName;
}

function use(database = state.primaryDatabase) {
	const db = state.pool[database];
	if (!db) throw new Error(`No such database: ${database}`);

	return db;
}
const ensureDb = possConnection =>
	(possConnection !== undefined ? possConnection : use(state.primaryDatabase));

function escape(data) {
	return ensureDb(this).escape(data);
}
function escapeId(data) {
	return ensureDb(this).escapeId(data);
}
function query(queryString, data) {
	return ensureDb(this).query(queryString, data);
}
function format(queryText, data) {
	return ensureDb(this).format(queryText, data);
}

export default {
	MODES,
	NAMES,

	setPrimaryDatabase,
	connect: connectBySource,
	use,

	escape: escape.bind(undefined),
	escapeId: escapeId.bind(undefined),
	query: query.bind(undefined),
	format: format.bind(undefined),
};
