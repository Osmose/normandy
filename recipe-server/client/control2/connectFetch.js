import autobind from 'autobind-decorator';
import React from 'react';
import { isEqual } from 'underscore';

import LoadingOverlay from 'control2/components/base/LoadingOverlay';

export default function connectFetch(config) {
  return Component => {
    class FetchWrapper extends React.Component {
      constructor(props) {
        super(props);
        this.state = {
          loading: true,
          error: null,
          ...config.defaults,
        };
      }

      componentWillMount() {
        this.callFetchData(this.props);
      }

      componentWillReceiveProps(newProps) {
        if (!isEqual(this.props, newProps)) {
          this.callFetchData(newProps);
        }
      }

      async callFetchData(props) {
        this.setState({ loading: true });
        try {
          await config.fetchData(props, ::this.setState);
          this.setState({ loading: false });
        } catch (error) {
          console.log(error);
          this.setState({
            loading: false,
            error: error.message,
          });
        }
      }

      render() {
        const { loading, error, ...data } = this.state;

        return (
          <LoadingOverlay loading={loading} error={error}>
            <Component setData={::this.setState} {...data} {...this.props} />
          </LoadingOverlay>
        );
      }
    }

    return FetchWrapper;
  };
}
