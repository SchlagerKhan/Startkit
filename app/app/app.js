import React, {Component, PropTypes} from 'react';

export default class App extends Component {
	static contextTypes = {
		serverData: PropTypes.any
	}
	static propTypes = {
		children: PropTypes.any
	}

	constructor (props, context) {
		super(props, context);
	}

	render () {
		const serverData = this.context.serverData;

		return (
			<article>
				{React.Children.map(this.props.children, child => {
					return React.cloneElement(child, {serverData});
				})}
			</article>
		);
	}
}
