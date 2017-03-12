import React, {Component, PropTypes} from 'react';

export default class DataWrapper extends Component {
	static childContextTypes = {
		serverData: PropTypes.any
	}
	static propTypes = {
		serverData: PropTypes.any,
		children: PropTypes.any
	}

	getChildContext () {
		return {
			serverData: this.props.serverData
		};
	}

	render () {
		return (
			<article>
				{this.props.children}
			</article>
		);
	}
}
