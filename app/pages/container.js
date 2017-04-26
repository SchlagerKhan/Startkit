import {castArray} from 'lodash';

import React, {Component} from 'react';
import PropTypes from 'prop-types';

import API from 'api';

function throwContainerError(msg) {
	throw new Error(`ContainerError: ${msg}`);
}

const container = (Target, _dataSchema = []) => {
	const dataSchema = castArray(_dataSchema);

	return class Container extends Component {
		static propTypes = {
			serverData: PropTypes.object,
		};

		state = {
			loading: true,
		};

		componentWillMount = () => this.initSchema();

		initSchema = () => {
			dataSchema.forEach(schema => {
				if (this.validateSchema(schema)) {
					if (schema.isServerData) {
						this.initServerData(schema);
					} else {
						this.initNotExistingData(schema);
					}
				}
			});
		};
		validateSchema = schema => {
			const {alias, apiUrl, defaultValue, isServerData} = schema;

			if (!alias) {
				throwContainerError('Missing "alias" in schema');
			}

			const {serverData} = this.props;
			const sdData = serverData && serverData[alias];

			if (isServerData && !sdData && !apiUrl) {
				throwContainerError(
					`"${alias}" not set in "serverData" and no "apiUrl" is provided`
				);
			}

			if (apiUrl && !defaultValue) {
				throwContainerError('Fetching data but "defaultValue" is not provided');
			}

			if (!isServerData && !apiUrl) {
				throwContainerError('Fetching data but "apiUrl" is not provided');
			}

			return true;
		};
		initServerData = ({alias, apiUrl, defaultValue}) => {
			const {serverData} = this.props;
			const sdData = serverData && serverData[alias];

			if (!sdData) {
				this.initNotExistingData(alias, apiUrl, defaultValue);
			} else {
				this.state[alias] = sdData;
			}
		};
		initNotExistingData = ({alias, apiUrl, defaultValue}) => {
			this.state[alias] = defaultValue;

			this.fetchData(alias, apiUrl);
		};

		fetchData = (alias, apiUrl) => {
			const self = this;

			API(apiUrl).then(response => {
				const newState = {};
				newState[alias] = response.result;

				self.setState(newState);
			});
		};

		render() {
			return <Target {...this.state} />;
		}
	};
};

export default dataSchema => {
	return target => container(target, dataSchema);
};
