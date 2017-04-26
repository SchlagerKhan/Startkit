import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {Link} from 'react-router';

import Container from 'container';

import H from 'helper';

import styles from './start.scss';

@Container([
	{
		isServerData: true,
		alias: 'testData',
	},
	{
		alias: 'users',
		apiUrl: 'users',
		defaultValue: [],
	},
])
export default class Start extends Component {
	static propTypes = {
		testData: PropTypes.array.isRequired,
		users: PropTypes.array.isRequired,
	};

	render() {
		const {testData, users} = this.props;

		return (
			<main className={styles.wrapper}>
				{H.misc.helmet(
					'Webpack Express React Boilerplate',
					'Some meta description'
				)}

				<p>Hello world!</p>

				<p>{JSON.stringify(testData)}</p>
				<p>{JSON.stringify(users)}</p>

				<Link to='/page'>Link to page</Link>
			</main>
		);
	}
}
