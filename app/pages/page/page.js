import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {Link} from 'react-router';

export default class Page extends Component {
	static propTypes = {
		serverData: PropTypes.any,
	};

	render() {
		return (
			<div>
				Page

				<Link to='/'>Link to main</Link>
			</div>
		);
	}
}
