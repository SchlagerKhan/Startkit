import {forEach, remove} from 'lodash';

import express from 'express';
import resource from 'resource-router-middleware';
import APIHelper from 'server-api-helper';

import Model from 'server-models/model';

const router = express.Router();

const testUsers = [
	{
		id: 0,
		content: 'tjo',
	},
	{
		id: 1,
		content: 'hej',
	},
	{
		id: 2,
		content: 'nej',
	},
];

router.use(APIHelper.ensureCorrectResponse);
router.use(APIHelper.validateRequest());

router.use(
	'/users',
	resource({
		id: 'user',

		// For requests with an `id`, you can pre-load the entity
		// which will later be sent to the the targetted REST method
		load(req, id, callback) {
			// callback(err, data)
			const user = testUsers.filter(tu => tu.id == id)[0]; // eslint-disable-line

			if (!user) {
				callback('User not found');
			} else {
				callback(null, user);
			}
		},

		// GET / - List all entities
		list({params}, res) {
			res.json({result: testUsers});
		},

		// POST / - Create a new entitiy
		create({body}, res) {
			body.id = testUsers.length;
			testUsers.push(body);
			res.send({result: body});
		},

		// GET /:id - Return an entity with the given id
		read({user}, res) {
			res.json({result: user});
		},

		// PATCH /:id - Updates an entity with the given id
		update({user, body}, res) {
			forEach(body, (value, key) => {
				if (key !== 'id') {
					body[key] = value;
				}
			});

			res.json({result: body});
		},

		// DELETE /:id - Deletes the entity with the given id
		delete({user}, res) {
			remove(testUsers, {id: user.id});

			res.json({result: user});
		},
	})
);
router.use(
	'/db',
	APIHelper.validateRequest(['foo']),
	resource({
		id: 'data',

		load(req, id, callback) {
			Model.read(id).then(testData => {
				if (testData.length > 0) callback(null, testData[0]);
				else callback('Model data not found');
			});
		},

		list({params}, res) {
			Model.list().then(data => res.json({result: data}));
		},

		read({data}, res) {
			res.json({result: data});
		},
	})
);

router.get('/', (req, res) => {
	res.send('Api base not implemented');
});
router.all('*', (req, res) => {
	res.sendStatus(404);
});

module.exports = router;
