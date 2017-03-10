import React, {Component} from 'react';

import styles from './main.scss';

export default class Main extends Component {

	render () {
		return (
			<main className={styles.wrapper}>
				Hello world!
			</main>
		);
	}
}
