import {map} from 'lodash';

import db from 'database';

const str = 'str1';
const arr = ['arr1', 'arr2'];
const obj = {key1: 'val1', key2: 'val2'};

beforeAll(done => {
	db.connect().then(done);
});

// Formatting
test('Escaping value', () => {
	const escStr = db.escape(str);

	expect(escStr).toBe(`'${str}'`);
});
test('Escaping identifier', () => {
	const escIdStr = db.escapeId(str);

	expect(escIdStr).toBe(`\`${str}\``);
});
test('Formatting single delimiters', () => {
	const inserts = [str, arr, obj];

	const strStr = db.escape(str);
	const arrStr = map(arr, value => db.escape(value)).join(',');
	const objStr = map(
		obj,
		(value, key) => `${db.escapeId(key)}=${db.escape(value)}`
	).join(',');

	const sqlString = db.format('? --- # --- :', inserts);

	expect(sqlString).toBe(`${strStr} --- ${arrStr} --- ${objStr}`);
});

test('Formatting double delimiters', () => {
	const inserts = [str, arr];

	const strStr = db.escapeId(str);
	const arrStr = map(arr, value => db.escapeId(value)).join(',');

	const sqlString = db.format('?? --- ##', inserts);

	expect(sqlString).toBe(`${strStr} --- ${arrStr}`);
});

test('Formatting string with escaped characters (\\?, \\#, \\??, \\##, \\:)', () => {
	const sqlQuery = '\\? --- \\# --- \\?? --- \\## --- \\:';
	const sqlString = db.format(sqlQuery);

	expect(sqlString).toBe(sqlQuery);
});
test('Formatting advanced insertions', () => {
	const inserts = [arr, obj, obj];
	const propAlias = 'prop';

	const propStr = map(
		arr,
		value => `${db.escapeId(propAlias)}=${db.escape(value)}`
	).join(',');
	const andStr = map(
		obj,
		(value, key) => `${db.escapeId(key)}=${db.escape(value)}`
	).join(' AND ');
	const orStr = map(
		obj,
		(value, key) => `${db.escapeId(key)}=${db.escape(value)}`
	).join(' OR ');

	const sqlString = db.format(`#${propAlias} --- :AND --- :OR`, inserts);

	expect(sqlString).toBe(`${propStr} --- ${andStr} --- ${orStr}`);
});

// Database
test('Use of not existing database', () => {
	expect(() => db.use('not-a-database')).toThrow();
});
test('Use of existing databse', () => {
	expect(db.use('test')).toBeDefined();
});
test('Use of primary database', () => {
	expect(db.use()).toBeDefined();
});

test('Database names', () => {
	expect(db.NAMES).toBeDefined();
});
test('Database modes', () => {
	expect(db.MODES).toBeDefined();
});
