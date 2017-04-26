import 'test-config';

import db from 'database';
import Model from 'server-models/model';

beforeAll(done => {
	db.connect().then(done);
});

test('List', done => {
	Model.list().then(result => expect(result).toBeArray()).then(done);
});
test('Read existing entry', done => {
	Model.read(0).then(result => expect(result).toBeObject()).then(done);
});
test('Read non existing entry', done => {
	Model.read(10000).then(result => expect(result).toBeNull()).then(done);
});
// test('Create new entry')
