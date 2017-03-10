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
	primaryMode: null,
};

function setPrimaryMode (mode) {
	this.state.primaryMode = mode;
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

	switch (mode) {
		case MODES.PRODUCTION:
			settings = {
				host: 'localhost',
				user: '',
				password: '',
				database: PRODUCTION_DB_NAME
			};
			break;
		case MODES.STAGE:
			settings = {
				host: 'localhost',
				user: '',
				password: '',
				database: STAGE_DB_NAME
			};
			break;
		case MODES.LOCAL:
			settings = {
				host: 'localhost',
				user: 'root',
				password: 'root',
				port: 8889,
				database: LOCAL_DB_NAME
			};
			break;
	}

	state.primaryMode = mode;

	return mysql.createConnection(settings)
				.then(connection => {
					setConfig(connection);
					state.pool[mode] = new Database(connection);
				});
}
function setConfig (connection) { // TODO: Make the check sequential

	connection.config.queryFormat = (queryText, values) => {
		if (!values) return queryText;

		let newQuery = queryText;
		values.forEach(val => {
			if (Array.isArray(val) && val.length > 0) {
				newQuery = newQuery.replace(/\#(\w+)/, (txt, key) => {
					const joined = val.map(v => {
						return `${key}=${escape(v)}`;
					}).join(' OR ');

					return `(${joined})`;
				});
			} if (typeof val === 'object' && val !== null) {
				newQuery = newQuery.replace(/\#/, () => {
					const keys = Object.keys(val);
					return keys.map((key) => {
						return `${key}=${escape(val[key])}`;
					}).join(' AND ');
				});
			} else {
				newQuery = newQuery.replace('?', escape(val));
			}
		});

		return newQuery;
	};

	return connection;
}

function use (mode = state.primaryMode) {
	return state.pool[mode];
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

	setPrimaryMode,
	connectFromSource,
	connect,
	use,

	escape,
	query,
	format
};
