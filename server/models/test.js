import db from 'database';

export function getTestData () {
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


export default {
	getTestData
};
