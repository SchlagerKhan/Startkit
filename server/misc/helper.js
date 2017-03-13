import db from 'database';

// Request
function testInputs (req, res, requirements = []) {
	const reqData = (Object.keys(req.query).length > 0 ? req.query : req.body) || {};
	const unset = requirements.filter(r => reqData[r] === undefined);
	const success = unset.length === 0;

	const response = {
		success,
		requestData: reqData
	};

	if (success) {
		return response;
	}


	Object.assign(response, {
		message: 'All requirements not set',
		requirements,
		unset
	});

	res.json(response);
	return response;
}

// Response
function notImplementedResponse (res, reqData) {
	res.send({
		success: false,
		error: 'Not implemented',
		requestData: reqData
	});
}
function errorResponse (res, reqData, errorMessage) {
	res.send({
		success: false,
		error: errorMessage,
		requestData: reqData
	});
}

// Database
function safeQuery (query, _data, response, successCallback, errorCallback) {
	const data = Array.isArray(_data) ? _data : [_data];

	const {database} = response.requestData;
	const _db = database ? db.use(database) : db;

	response._query = query;
	response.query = _db.format(query, data);

	_db.query(query, data)
		.then(result => {
			response.success = true;
			response.result = result;

			if (typeof successCallback === 'function') {
				successCallback(response, result);
			} else if (typeof successCallback === 'object' && !successCallback.headersSent) { // res object
				successCallback.send(response);
			}
		})
		.catch(err => {
			response.error = err.toString();
			response.success = false;

			console.error('Query: ', query, data);
			console.error(err.toString());

			if (typeof errorCallback === 'function') {
				errorCallback(response);
			} else if (typeof errorCallback === 'object' && !errorCallback.headersSent) { // res object
				errorCallback.send(response);
			}
		});
}
function plainQuery (query, data) {
	return db.query(query, data).catch(console.error);
}

export default {
	request: {
		test: testInputs
	},
	response: {
		test: testInputs,
		notImplemented: notImplementedResponse,
		error: errorResponse
	},
	db: {
		query: safeQuery,
		plainQuery: plainQuery,
		format: db.format
	}
};
