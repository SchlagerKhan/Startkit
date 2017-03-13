import Promise from 'bluebird';
import $ from 'jquery';

// API
function ajax (method = 'GET', _url, data = {}, {rejectError, resolveError} = {}) { // eslint-disable-line
	const request = method === 'GET' ? $.get : $.post;
	const url = api.url(_url);

	return new Promise((resolve, reject) => {
		request(url, data, result => {
			if (result.success || resolveError) resolve(result);
			else if (rejectError) reject(result);
			else console.error('Unable to get: ' + url);
		});
	});
}

const api = ajax.bind(this, 'GET');
api.get = ajax.bind(this, 'GET');
api.post = ajax.bind(this, 'POST');

api.url = (path) => {
	return '/api/' + path;
};

export default {
	api
};
