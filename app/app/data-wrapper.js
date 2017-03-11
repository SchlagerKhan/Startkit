import React, {Component, PropTypes} from 'react';
// import xor from 'base64-xor';

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
