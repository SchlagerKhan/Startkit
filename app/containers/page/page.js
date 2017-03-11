import React, {Component, PropTypes} from 'react';

export default class Page extends Component {
	static propTypes = {
		serverData: PropTypes.any
	}

	render () {
		return (
			<div>
				Page
			</div>
		);
	}
}
