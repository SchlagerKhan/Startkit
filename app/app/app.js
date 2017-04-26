import React, {Component} from 'react';
import PropTypes from 'prop-types';

import API from 'api';

import style from '../sass/_styles.scss';

export default class App extends Component {
	static contextTypes = {
		serverData: PropTypes.any,
	};
	static propTypes = {
		children: PropTypes.any,
	};

	constructor(props, context) {
		super(props, context);
	}
	componentDidMount() {
		API('db', {foo: 'bar'}).then(console.log).catch(console.error);
	}

	render() {
		const {serverData} = this.context;

		const initialOverlayStyle = {
			position: 'absolute',
			top: 0,
			left: 0,
			right: 0,
			bottom: 0,
			backgroundColor: '#fff',
			zIndex: 10000,
		};

		return (
			<article>
				<div className={style.initialOverlay} style={initialOverlayStyle} />

				{React.Children.map(this.props.children, child => {
					return React.cloneElement(child, {serverData});
				})}
			</article>
		);
	}
}
