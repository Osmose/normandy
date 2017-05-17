import React, { PropTypes as pt } from 'react';
import { reduxForm, SubmissionError } from 'redux-form';
import { push } from 'react-router-redux';
import { apiFetch } from 'control/components/extensions/utils';
import { ControlField } from 'control/components/Fields';

/**
 * Container for state related to the extension form. Handles fetching data
 * from the API and displaying error messages when things go wrong.
 */
export default class ExtensionFormPage extends React.Component {
  static propTypes = {
    params: pt.object.isRequired, // react-router parameters
  }

  constructor(props) {
    super(props);
    this.state = {
      error: null, // Error message to show to user
      extension: null, // Extension being edited
    };

    this.handleSubmit = ::this.handleSubmit;
  }

  componentDidMount() {
    this.fetchData(this.props.params);
  }

  componentWillReceiveProps(nextProps) {
    // Only fetch new content if the query parameters are changing.
    if (nextProps.params.extensionId !== this.props.params.extensionId) {
      this.fetchData(nextProps.params);
    }
  }

  async fetchData(params) {
    if (params.extensionId === undefined) {
      this.setState({
        extension: {},
      });
      return;
    }

    const url = new URL(`/api/v1/extension/${params.extensionId}/`, window.location);
    const response = await apiFetch(url);
    const data = await response.json();

    if (!response.ok) {
      this.setState({
        error: data.detail,
      });
    } else {
      this.setState({
        extension: data,
      });
    }
  }

  async handleSaveNew(values) {
    const url = new URL('/api/v1/extension/', window.location);
    const response = await apiFetch(url, {
      method: 'POST',
      body: JSON.stringify(values),
    });
    const data = await response.json();

    if (!response.ok) {
      throw new SubmissionError(data);
    } else {
      this.props.dispatch(
        push(`/control/extension/${data.id}//`)
      );
    }
  }

  async handleSave(extensionId, values) {
    const url = new URL(`/api/v1/extension/${extensionId}/`, window.location);
    const response = await apiFetch(url, {
      method: 'PATCH',
      body: JSON.stringify(values),
    });
    const data = await response.json();

    if (!response.ok) {
      // TODO: Temporary message instead of permanent
      this.setState({
        error: data.detail,
      });
    } else {
      this.setState({
        extension: data,
      });
    }
  }

  handleSubmit(values) {
    const { extensionId } = this.props.params;
    if (extensionId) {
      return this.handleSave(extensionId, values);
    } else {
      return this.handleSaveNew(values);
    }
  }

  render() {
    const { extension, error } = this.state;

    if (error !== null) {
      return (
        <div className="fluid-8 notice error">
          <i className="fa fa-exclamation-triangle fa-3x fa-fw" />
          <p>Could not load extension: {error}</p>
        </div>
      );
    } else if (extension === null) {
      return (
        <div className="fluid-8 notice loading">
          <i className="fa fa-spinner fa-spin fa-3x fa-fw" />
          <p>Loading...</p>
        </div>
      );
    }

    return (
      <div className="fluid-8">
        <WrappedExtensionForm initialValues={extension} onSubmit={this.handleSubmit} />
      </div>
    );
  }
}

export function ExtensionForm({ handleSubmit }) {
  return (
    <form className="control-form" onSubmit={handleSubmit}>
      <ControlField label="Name" name="name" component="input" type="text" />
      <div className="form-actions">
        <button type="submit" className="button">Save Extension</button>
      </div>
    </form>
  );
}
ExtensionForm.propTypes = {
  extension: pt.object.isRequired,
  handleSubmit: pt.func.isRequire,
};

export const WrappedExtensionForm = reduxForm({
  form: 'extension-form',
})(ExtensionForm);
