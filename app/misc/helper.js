import Promise from 'bluebird';
import $ from 'jquery';

// API
function ajax (method = 'GET', _url, data = {}, {rejectError, resolveError} = {}) { // eslint-disable-line
	const request = method === 'GET' ? $.get : $.post;
	const url = api.url(_url);

	return new Promise((resolve, reject) => {
		request(url, data)
		 	.done(result => {
				if (result.success || resolveError) resolve(result);
				else error(result);
			})
			.fail(error);

		function error (_err) {
			const err = typeof _err === 'string' ? _err : JSON.stringify(_err);

			if (rejectError) {
				reject(err, url);
			}

			console.error('Unable to get: ' + url);
		}
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
