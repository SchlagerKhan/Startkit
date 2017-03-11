import _ from 'lodash';
import mysql from 'promise-mysql';

const PRODUCTION_DB_NAME 	= 'main';
const STAGE_DB_NAME 		= 'stage';
const LOCAL_DB_NAME 		= 'test';

export const MODES = {
	PRODUCTION: 'production',
	STAGE: 'stage',
	LOCAL: 'local'
};

const state = {
	pool: {},
	primaryDatabase: null,
};

function setPrimaryDatabase (mode) {
	this.state.primaryDatabase = mode;
}

function Database (connection) {
	return {
		connection,
		escape: escape.bind(connection),
		query: query.bind(connection),
		format: format.bind(connection)
	};
}

function connectFromSource() {
	const source = process.env.NODE_SOURCE;

	switch (source) {
		case 'production':
			return connect(MODES.PRODUCTION);
		case 'stage':
			return connect(MODES.STAGE);
		case 'local':
			return connect(MODES.LOCAL);
		default:
			throw new Error(`No such source: ${source}`);
	}
}
function connect (mode) {
	let settings;
	let dbName;

	switch (mode) {
		case MODES.PRODUCTION:
			dbName = PRODUCTION_DB_NAME;
			settings = {
				host: 'localhost',
				user: '',
				password: '',
				database: dbName
			};
			break;
		case MODES.STAGE:
			dbName = STAGE_DB_NAME;
			settings = {
				host: 'localhost',
				user: '',
				password: '',
				database: dbName
			};
			break;
		case MODES.LOCAL:
			dbName = LOCAL_DB_NAME;
			settings = {
				host: 'localhost',
				user: 'root',
				password: 'root',
				port: 8889,
				database: dbName
			};
			break;
	}

	state.primaryDatabase = dbName;

	return mysql.createConnection(settings)
				.then(connection => {
					state.pool[dbName] = new Database(setConfig(connection));
				});
}
function setConfig (connection) {
	/**
	 * 		#prop [Array]
	 * 			Transforms the array into and array of prop=value1 OR prop=value2 etc...
	 *
	 *      :UPDATE [Object]
	 *      	Transforms the objects key-values into a string of prop1=value1, prop2=value2 etc...
	 *
	 * 		:AND [Object]
	 * 			Transforms the objects key-values into a string of prop1=value1 AND prop2=value2 etc....
	 *
	 * 		:OR [Object]
	 * 			Transforms the objects key-values into a string of prop1=value1 OR prop2=value2 etc...
	 *
	 * 		? [String | Number | Null]
	 * 			Escapes the value and replaces the question-mark with it
	 */

	connection.connection.config.queryFormat = (queryText, values) => { // Double connection since we use promise-mysql
		if (!values) return queryText;

		let newQuery = queryText;
		const regex = /(\s\?|\s#\s|\s#\w+|:UPDATE|:AND|:OR)/g;

		let _match;
		let vIndex = 0;
		while ((_match = regex.exec(queryText)) !== null) { // eslint-disable-line
		    if (_match.index === regex.lastIndex) regex.lastIndex++; // This is necessary to avoid infinite loops with zero-width matches

			const match = _.findLast(_match);
			const key = match.trim();
			const value = values[vIndex];

			if (!value) throw new Error('Not enought values for the matches made', queryText, match);

			let safeType;
			if (_.startsWith(key, ':')) safeType = 'object';
			else if (_.startsWith(key, '#')) safeType = 'array';

			if (!safeQuery(value, safeType)) throw new Error(`Faulty query-value pair: ${match}, ${value} (supposed to be: ${safeType}), ${queryText}`);

			let insertStr;
			switch (key) {
				case ':UPDATE':
					insertStr = mapProps(value).join(', ');
					break;
				case ':AND':
					insertStr = mapProps(value).join(' AND ');
					break;
				case ':OR':
					insertStr = mapProps(value).join(' OR ');
					break;
				case '#':
					insertStr = value.join(', ');
					break;
				case '?':
					insertStr = value;
					break;
				default:
					if (_.startsWith(key, '#')) {
						const prop = key.replace('#', '').trim();
						insertStr = value.map(val => `${prop}=${val}`).join(' OR ');
					}
					break;

			}

			if (insertStr) {
				newQuery = newQuery.replace(match, ` ${insertStr} `);
			}

			vIndex++;
		}

		return newQuery;
	};

	return connection;

	function mapProps (values) {
		return _.values(_.mapValues(values, (value, key) => `${key}=${value}`));
	}
	function safeQuery (value, type) {
		if (type === 'array' && !Array.isArray(value)) return false;
		if (type === 'object' && !(typeof value === 'object' && value !== null)) return false;
		if (!type && (value !== null && (['string', 'number'].indexOf(typeof value) === -1))) return false;

		return true;
	}
}

function use (database = state.primaryDatabase) {
	const db = state.pool[database];
	if (!db) throw new Error(`No such database: ${database}`);

	return db;
}
function getDb (possConnection) {
	return possConnection.MODES ? use() : possConnection; // Checks if the possConnection the global this-object, if so it returns the primary mode db (through use), otherwise it is hopefully an mysql-connection
}

// All following functions has the ability to be bound to a connection variable
function escape (data) {
	const db = getDb(this);

	return db.escape(data);
}
function query (queryString, consts) {
	const db = getDb(this);

	return db.query(queryString, consts);
}
function format (queryText, data) {
	const db = getDb(this);

	return db.format(queryText, data);
}


export default {
	MODES,

	setPrimaryDatabase,
	connectFromSource,
	connect,
	use,

	escape,
	query,
	format
};
