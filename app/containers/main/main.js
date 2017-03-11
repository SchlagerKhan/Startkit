import React, {Component, PropTypes} from 'react';

import styles from './main.scss';

export default class Main extends Component {
	static propTypes = {
		serverData: PropTypes.any
	}

	render () {
		return (
			<main className={styles.wrapper}>
				<p>Hello world!</p>

				<p>{JSON.stringify(this.props.serverData)}</p>
			</main>
		);
	}
}
