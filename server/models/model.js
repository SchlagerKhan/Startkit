import db from 'database';

function list() {
	return db.query('SELECT * FROM test');
}
function read(id) {
	if (isNaN(id)) return null;

	return db.query(`SELECT * FROM test WHERE id=${id}`).then(result => {
		return result.length > 0 ? result[0] : null;
	});
}
function create(newObject) {}
function update(updatedObject) {}
function del(ids) {}

export default {
	list,
	read,
	create,
	update,
	delete: del,
};
