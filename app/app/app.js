import React, {Component, PropTypes} from 'react';

import H from 'helper';

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
	componentDidMount () {
		H.api('test')
			.then(console.log)
			.catch(console.error);
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
