import React, { PropTypes as pt } from 'react';
import { Link, PropTypes as routerPt } from 'react-router';
import { isEqual } from 'underscore';

function apiFetch(input, init) {
  return fetch(input, {
    credentials: 'same-origin',
    headers: {
      'X-CSRFToken': document.getElementsByTagName('html')[0].dataset.csrf,
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    ...init,
  });
}

/**
 * Container for state related to the extension listing. Handles fetching data
 * from the API and displaying error messages when things go wrong.
 */
export default class ExtensionListPage extends React.Component {
  static propTypes = {
    location: routerPt.location, // react-router location
  }

  constructor(props) {
    super(props);
    this.state = {
      error: null, // Error message to show to user
      extensions: null, // List of extensions from the API
      nextPage: null, // URL to the next page of results in the API
      previousPage: null, // URL to the previous page of results in the API
    };
  }

  componentDidMount() {
    this.fetchData(this.props.location);
  }

  componentWillReceiveProps(nextProps) {
    // Only fetch new content if the query parameters are changing.
    if (!isEqual(nextProps.location.query, this.props.location.query)) {
      this.fetchData(nextProps.location);
    }
  }

  /**
   * Fetch data from the extension API and update state.
   * @param {Location} location
   *   Location passed in by react-router for the current URL containing query
   *   parameters to pass on to the API.
   */
  async fetchData(location) {
    const url = new URL('/api/v1/extension/', window.location);
    url.searchParams.set('page', location.query.page || 1);

    const response = await apiFetch(url);
    const data = await response.json();

    if (!response.ok) {
      this.setState({
        error: data.detail,
      });
    } else {
      this.setState({
        extensions: data.results,
        nextPage: data.next,
        previousPage: data.previous,
      });
    }
  }

  /**
   * Page number from URL query parameters.
   * @return {Number}
   */
  get page() {
    return Number.parseInt(this.props.location.query.page, 10) || 1;
  }

  /**
   * URL to the next page of results, or null if there is no next page.
   */
  get nextPageUrl() {
    if (this.state.nextPage) {
      const url = new URL(document.location);
      url.searchParams.set('page', this.page + 1);
      return url.pathname + url.search;
    }

    return null;
  }

  /**
   * URL to the previous page of results, or null if there is no previous page.
   */
  get previousPageUrl() {
    if (this.state.previousPage) {
      const url = new URL(document.location);
      url.searchParams.set('page', this.page - 1);
      return url.pathname + url.search;
    }

    return null;
  }

  render() {
    const { extensions, error } = this.state;

    if (error !== null) {
      return (
        <div className="fluid-8 notice error">
          <i className="fa fa-exclamation-triangle fa-3x fa-fw" />
          <p>Could not load extensions: {error}</p>
        </div>
      );
    } else if (extensions === null) {
      return (
        <div className="fluid-8 notice loading">
          <i className="fa fa-spinner fa-spin fa-3x fa-fw" />
          <p>Loading...</p>
        </div>
      );
    }

    return (
      <div className="fluid-8">
        <ExtensionList extensions={extensions} />
        <Pagination next={this.nextPageUrl} previous={this.previousPageUrl} />
      </div>
    );
  }
}

export function ExtensionList({ extensions }) {
  return (
    <table>
      <thead>
        <tr>
          <th>Name</th>
          <th>URL</th>
        </tr>
      </thead>
      <tbody>
        {extensions.map(extension => (
          <tr key={extension.id}>
            <td>{extension.name}</td>
            <td><a href={extension.xpi}>{extension.xpi}</a></td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
ExtensionList.propTypes = {
  extensions: pt.array.isRequired, // List of extensions from the API
};

export function Pagination({ next, previous }) {
  return (
    <div className="pagination">
      {previous &&
        <Link className="button" to={previous}>
          <i className="fa fa-chevron-left" />
          Previous
        </Link>
      }
      {next &&
        <Link className="button" to={next}>
          Next
          <i className="fa fa-chevron-right" />
        </Link>
      }
    </div>
  );
}
Pagination.propTypes = {
  previous: pt.string, // URL to the previous page of results
  next: pt.string, // URL to the next page of results
};
