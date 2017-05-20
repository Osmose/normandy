import React from 'react';
import { browserHistory, Link } from 'react-router';
import { Alert, Button, Breadcrumb, message, Popconfirm } from 'antd';
import autobind from 'autobind-decorator';
import { PromiseState } from 'react-refetch';

import api from 'control2/api';
import * as refetch from 'control2/refetch';
import LoadingOverlay from 'control2/components/base/LoadingOverlay';
import LinkButton from 'control2/components/base/LinkButton';
import PageBreadcrumb from 'control2/components/base/PageBreadcrumb';
import RecipeHistory from 'control2/components/recipes/RecipeHistory';
import RecipeForm from 'control2/components/recipes/RecipeForm';
import FormActions from 'control2/components/base/FormActions';
import { get } from 'control2/utils';

export function _RecipeEditPage({ revisionFetch, historyFetch }) {
  const promiseState = PromiseState.all([revisionFetch, historyFetch]);
  return (
    <LoadingOverlay promiseState={promiseState}>
      {promiseState.fulfilled &&
        <div>
          <RecipeEditBreadcrumb revision={revisionFetch.value} />
          <RecipeEditForm revision={revisionFetch.value} history={historyFetch.value} />
        </div>
      }
    </LoadingOverlay>
  );
}

const RecipeEditPage = refetch.connect(props => {
  const { params } = props;

  return {
    revisionFetch: {
      ...refetch.fetchRevision(params.revisionId),
      andThen(revision) {
        return {
          historyFetch: {
            ...refetch.fetchRecipeHistory(revision.recipe.id),
            force: true,
          },
        };
      },
    },
    historyFetch: { value: [] },
  };
})(_RecipeEditPage);

export function RecipeEditBreadcrumb({ revision }) {
  return (
    <PageBreadcrumb>
      <Breadcrumb.Item><Link to="/control2/recipe/">Recipes</Link></Breadcrumb.Item>
      <Breadcrumb.Item>
        <Link to={`/control2/recipe/${revision.recipe.id}/`}>
          {revision.recipe.name}
        </Link>
      </Breadcrumb.Item>
      <Breadcrumb.Item>
        Revision: {revision.id.slice(0, 7)}
      </Breadcrumb.Item>
    </PageBreadcrumb>
  );
}

@autobind
export class RecipeEditForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      formErrors: {},
    };
  }

  async handleSubmit(values) {
    const { revision } = this.props;
    try {
      const data = await api.createRevision(revision.recipe.id, values);
      message.success(`Updated ${data.name} successfully`);
      browserHistory.push(`/control2/recipe/revision/${data.latest_revision.id}/`);
    } catch (error) {
      message.error(`Failed to save recipe: ${error.message}`);
      if (error.data) {
        this.setState({ formErrors: error.data });
      }
    }
  }

  render() {
    const { revision, history } = this.props;
    const { formErrors } = this.state;
    const formActions = <RecipeEditFormActions revision={revision} />;

    return (
      <div className="form-page">
        <div className="recipe-form">
          {!revision.is_latest && <RevisionWarning revision={revision} />}
          <RecipeForm
            recipe={revision.recipe}
            readOnly={!revision.is_latest}
            errors={formErrors}
            onSubmit={this.handleSubmit}
            formActions={formActions}
          />
        </div>
        {history.length > 0 &&
          <RecipeHistory history={history} selectedRevision={revision.id} />
        }
      </div>
    );
  }
}

@autobind
export class RecipeEditFormActions extends React.Component {
  handleClickSave() {
    this.props.triggerSubmit();
  }

  render() {
    const { revision } = this.props;
    return (
      <FormActions>
        {revision.is_latest &&
          <FormActions.Primary>
            {!revision.approval_request &&
              <RequestApprovalAction revision={revision} />
            }
            <SaveRevisionAction revision={revision} onClick={this.handleClickSave} />
          </FormActions.Primary>
        }
        <FormActions.Secondary>
          <LinkButton type="default" to={`/control2/recipe/new/?clone=${revision.id}`}>
            Clone to New Recipe
          </LinkButton>
        </FormActions.Secondary>
      </FormActions>
    );
  }
}

@autobind
export class RequestApprovalAction extends React.Component {
  async handleClickRequestApproval() {
    const { revision } = this.props;
    try {
      await api.requestApproval(revision.id);
      message.success(`Submitted ${revision.recipe.name} for approval.`);
      browserHistory.push(`/control2/recipe/revision/${revision.id}/review/`);
    } catch (error) {
      message.error(`Failed to submit approval request: ${error.message}`);
    }
  }

  render() {
    return (
      <Button type="default" onClick={this.handleClickRequestApproval}>
        Request Approval
      </Button>
    );
  }
}

export function SaveRevisionAction({ revision, onClick }) {
  // Saving a new revision will delete the pending approval request if it
  // exists, so we prompt to confirm that we want to delete it.
  if (get(revision, 'approval_request.approved') === null) {
    return (
      <Popconfirm
        title="Saving will delete a pending approval request. Still want to save?"
        okText="Save Anyway"
        cancelText="Nevermind"
        onConfirm={onClick}
      >
        <Button type="primary">Save</Button>
      </Popconfirm>
    );
  }

  return (
    <Button type="primary" onClick={onClick}>Save</Button>
  );
}

export function RevisionWarning({ revision }) {
  return (
    <Alert
      message={`You are viewing a past revision of this recipe (${revision.id}).`}
      type="info"
    />
  );
}

export default RecipeEditPage;
