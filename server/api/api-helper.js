import moment from 'moment';

import expressValidator from 'express-validator';
import mung from 'express-mung';

import _db from 'database';

function getRequestData(req) {
	return {
		...req.params,
		...req.body,
		...req.query,
	};
}

function getStatusMessage(code) {
	switch (code) {
		case 200:
			return 'OK';
		case 201:
			return 'Created';
		case 204:
			return 'No Content';
		case 301:
			return 'Moved permanently';
		case 400:
			return 'Bad request';
		case 401:
			return 'Unauthorized';
		case 403:
			return 'Forbidden';
		case 404:
			return 'Not Found';
		case 409:
			return 'Conflict';
		case 500:
			return 'SeverError';
		case 503:
			return 'Service Unavailable';
		default:
			return `Unknown code: ${code}`;
	}
}
function getSuccessStatusCode(method) {
	switch (method) {
		case 'GET':
			return 200;
		case 'POST':
			return 201;
		case 'DELETE':
			return 204;
		case 'PUT':
			return 200;
		default:
			console.error(`No such supported method: ${method}`);
			return 200;
	}
}
function getSuccessStatus(methodOrCode) {
	const statusCode = typeof methodOrCode === 'string'
		? getSuccessStatusCode(methodOrCode)
		: methodOrCode;

	return {
		code: statusCode,
		message: getStatusMessage(statusCode),
		success: true,
	};
}

function sendError(res, statusCode, errors, messages) {
	const status = {
		code: statusCode,
		message: getStatusMessage(statusCode),
		success: false,
	};

	res.json({
		status,
		errors,
		messages,
	});
}
function sendResult(res, statusCode, result, messages) {
	res.json({
		status: getSuccessStatus(statusCode),
		result,
		messages,
	});
}

function ensureCorrectResponse(body, req, res) {
	body.timestamp = moment().format();

	const {result, errors} = body;
	const resStatusCode = res.statusCode;

	// Each response need either a result or errors
	if (!result && !errors) {
		console.log(
			`EnsureCorrectResponse: ${req.url} | Both \'Result\' and \'Errors\' are unset`
		);
	} else if (result) {
		// If the request is successful, the status can be autoset
		body.status = body.status
			? body.status
			: resStatusCode && getSuccessStatus(resStatusCode);
	}

	// Each response needs a status object
	if (!body.status) {
		console.log(
			`EnsureCorrectResponse: ${req.url} | Insufficient status information`
		);
	} else {
		// Ensure the correct status code for the request is set
		// res.status(body.status.code);
	}

	return body;
}

function validator() {
	return expressValidator({
		errorFormatter: (param, msg, value) => `Missing request data: '${param}'`, // eslint-disable-line
		customValidators: {},
	});
}
function validateRequest(requirements = []) {
	return (req, res, next) => {
		if (Array.isArray(requirements)) {
			requirements.forEach(rment => {
				req.check(rment).notEmpty();
			});
		} else if (typeof requirements === 'object') {
			req.check(requirements);
		}

		req.getValidationResult().then(result => {
			if (!result.isEmpty()) {
				sendError(res, 400, result.array());
			} else {
				req.requestData = getRequestData(req);

				next();
			}
		});
	};
}

function plainQuery(query, req) {
	const {database} = req.requestData;

	const db = database ? _db.use(database) : _db;

	return db.query(query);
}
function safeQuery(query, dataAlias, req, res) {
	return plainQuery(query, req).then(data => {
		const result = {};
		result[dataAlias] = data;

		res.send({result});
	});
}

export default {
	getStatusMessage,
	sendError,
	sendResult,

	ensureCorrectResponse: mung.json(ensureCorrectResponse),

	validator,
	validateRequest,

	safeQuery,
};
