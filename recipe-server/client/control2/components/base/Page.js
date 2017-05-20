import React from 'react';
import { isEqual } from 'underscore';
import Notice from 'control2/components/base/Notice';

export default class Page extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      error: null,
      fetching: true,
    };
  }

  componentDidMount() {
    this.fetchData(this.props.location, this.props.params);
  }

  componentWillReceiveProps(nextProps) {
    // Only fetch new content if the query parameters are changing.
    const paramsEqual = isEqual(nextProps.params, this.props.params);
    const queryEqual = isEqual(nextProps.location.query, this.props.location.query);
    if (!paramsEqual || !queryEqual) {
      this.setState({
        error: null,
        fetching: true,
      });
      this.fetchData(nextProps.location, nextProps.params);
    }
  }

  async fetchData(location, params) {
    try {
      await this.props.fetchData(location, params);
      this.setState({ fetching: false });
    } catch (error) {
      this.setState({ error: error.message, fetching: false });
    }
  }

  render() {
    const { children } = this.props;
    const { error, fetching } = this.state;

    if (error !== null) {
      return (
        <Notice icon="fa-exclamation-triangle" message={`Could not load page: ${error}`}>
          {children}
        </Notice>
      );
    } else if (fetching) {
      return (
        <Notice icon="fa-spinner fa-spin" message="Loading...">
          {children}
        </Notice>
      );
    }

    return <div>{children}</div>;
  }
}
