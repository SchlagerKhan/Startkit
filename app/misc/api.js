import Promise from 'bluebird';
import fetchival from 'fetchival';

function fetch(method, _url, data, options = {}) {
	const {resolveError, rejectError} = options;

	const url = `/api/${_url}`;

	if (process.env.NODE_ENV === 'test') return Promise.resolve({});

	return fetchival(url)[method](data).then(catchResponse, catchResponse);

	function catchResponse(response) {
		if (process.env.NODE_IS_DEV && !response.status.success) {
			console.error(response);
		}

		if (response.status.success || resolveError) {
			return Promise.resolve(response);
		} else if (rejectError) return Promise.reject(response);

		return null;
	}
}

const get = fetch.bind(this, 'get');
get.post = fetch.bind(this, 'post');
get.put = fetch.bind(this, 'put');
get.delete = fetch.bind(this, 'delete');

export default get;
