import React from 'react';
import { browserHistory, Link } from 'react-router';
import { Breadcrumb, Button, message } from 'antd';
import autobind from 'autobind-decorator';

import api from 'control2/api';
import { get } from 'control2/utils';
import Page from 'control2/components/base/Page';
import PageBreadcrumb from 'control2/components/base/PageBreadcrumb';
import RecipeForm from 'control2/components/recipes/RecipeForm';
import FormActions from 'control2/components/base/FormActions';

@autobind
export default class RecipeCreatePage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      revision: null,
    };
  }

  async fetchData(location) {
    const { clone } = location.query;
    if (clone) {
      const revision = await api.fetchRevision(clone);
      this.setState({ revision });
    }
  }

  render() {
    const { revision } = this.state;
    const { location, params } = this.props;

    return (
      <Page fetchData={this.fetchData} location={location} params={params}>
        <RecipeCreateBreadcrumb isClone={revision} />
        <RecipeCreateForm revision={revision} />
      </Page>
    );
  }
}

export function RecipeCreateBreadcrumb({ isClone }) {
  return (
    <PageBreadcrumb>
      <Breadcrumb.Item><Link to="/control2/recipe/">Recipes</Link></Breadcrumb.Item>
      <Breadcrumb.Item>
        {isClone ? 'Clone Recipe' : 'New Recipe'}
      </Breadcrumb.Item>
    </PageBreadcrumb>
  );
}

@autobind
export class RecipeCreateForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      formErrors: {},
    };
  }

  async handleSubmit(values) {
    try {
      const data = await api.createRecipe(values);
      message.success(`Created ${data.name} successfully`);
      browserHistory.push(`/control2/recipe/${data.id}/`);
    } catch (error) {
      message.error('Failed to create recipe.');
      if (error.data) {
        this.setState({ formErrors: error.data });
      }
    }
  }

  render() {
    const { revision } = this.props;
    const { formErrors } = this.state;
    const formActions = <RecipeCreateFormActions />;

    return (
      <div className="form-page">
        <div className="recipe-form">
          <RecipeForm
            recipe={get(revision, 'recipe')}
            errors={formErrors}
            onSubmit={this.handleSubmit}
            formActions={formActions}
          />
        </div>
      </div>
    );
  }
}

export function RecipeCreateFormActions() {
  return (
    <FormActions>
      <FormActions.Primary>
        <Button type="primary" htmlType="submit">Save</Button>
      </FormActions.Primary>
    </FormActions>
  );
}
