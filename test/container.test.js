import 'test-config';

import React, {Component} from 'react';
import {shallow} from 'enzyme';

import Container from 'container';

function getRenderedComponent(dataSchema) {
	@Container(dataSchema)
	class Target extends Component {
		render() {
			return (
				<div>
					test string
				</div>
			);
		}
	}

	return shallow(<Target />);
}
function testSchema(dataSchema) {
	const component = getRenderedComponent(dataSchema);

	// Dive renders the only child of the current component, i.e. the target.
	expect(component.dive().text()).toEqual('test string');

	return component;
}
function testFaultySchema(dataSchema) {
	let error;

	try {
		getRenderedComponent(dataSchema);
	} catch (err) {
		error = err;
	}

	expect(error).toBeDefined();
}

test('Empty schema', () => {
	testSchema();
});
test('Complete fetching schema', () => {
	testSchema({
		alias: 'testData',
		apiUrl: 'test-url',
		defaultValue: {},
	});
});

test('Missing schema alias', () => testFaultySchema({}));
test('Faulty serverData', () => {
	testFaultySchema({
		isServerData: true,
		alias: 'testData',
	});
});
test('Missing schame apiUrl', () => {
	testFaultySchema({
		alias: 'testData',
		defaultValue: [],
	});
});
test('Missing schema defaultValue', () => {
	testFaultySchema({
		alias: 'testData',
		apiUrl: 'test-url',
	});
});
