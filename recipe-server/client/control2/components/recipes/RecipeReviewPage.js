import React from 'react';
import { isEqual } from 'underscore';
import { browserHistory, Link } from 'react-router';
import { Breadcrumb, Button, Card, Form, Input, message, Tag } from 'antd';
import autobind from 'autobind-decorator';

import api from 'control2/api';
import * as refetch from 'control2/refetch';
import LoadingOverlay from 'control2/components/base/LoadingOverlay';
import PageBreadcrumb from 'control2/components/base/PageBreadcrumb';
import RecipeForm from 'control2/components/recipes/RecipeForm';
import FormActions from 'control2/components/base/FormActions';
import ControlForm from 'control2/components/base/ControlForm';

export function _RecipeReviewPage({ revisionFetch }) {
  const revision = revisionFetch.value;
  return (
    <LoadingOverlay promiseState={revisionFetch}>
      {revisionFetch.fulfilled &&
        <div>
          <RecipeReviewBreadcrumb revision={revision} />
          <RecipeReview revision={revision} />
        </div>
      }
    </LoadingOverlay>
  );
}

const RecipeReviewPage = refetch.connect(props => {
  const { revisionId } = props.params;
  return {
    revisionFetch: {
      ...refetch.fetchRevision(revisionId),
      then(revision) {
        if (!revision.approval_request) {
          return {
            value: Promise.reject(`No approval request found for revision ${revision.id}.`),
          };
        }
        return { value: revision };
      },
    },
  };
})(_RecipeReviewPage);

export function RecipeReviewBreadcrumb({ revision }) {
  return (
    <PageBreadcrumb>
      <Breadcrumb.Item><Link to="/control2/recipe/">Recipes</Link></Breadcrumb.Item>
      <Breadcrumb.Item>
        <Link to={`/control2/recipe/${revision.recipe.id}/`}>
          {revision.recipe.name}
        </Link>
      </Breadcrumb.Item>
      <Breadcrumb.Item>
        <Link to={`/control2/recipe/revision/${revision.id}/`}>
          Revision: {revision.id.slice(0, 7)}
        </Link>
      </Breadcrumb.Item>
      <Breadcrumb.Item>Review</Breadcrumb.Item>
    </PageBreadcrumb>
  );
}

export function RecipeReview({ revision }) {
  return (
    <div className="review-page">
      <div className="recipe-form">
        <RecipeForm
          recipe={revision.recipe}
          readOnly
        />
        {revision.approval_request.approved === null}
        <ApprovalRequest revision={revision} />
      </div>
    </div>
  );
}

export function ApprovalRequest({ revision }) {
  const request = revision.approval_request;
  if (request.approved === null) {
    return <WrappedApprovalRequestForm revision={revision} />;
  }

  let title;
  let tag;
  if (request.approved) {
    title = `Approved by ${request.approver.email}.`;
    tag = <Tag color="green">Approved</Tag>;
  } else {
    title = `Rejected by ${request.approver.email}`;
    tag = <Tag color="red">Rejected</Tag>;
  }

  return (
    <Card title={title} extra={tag}>
      <p>Review Comment: {request.comment}</p>
    </Card>
  );
}

export class ApprovalRequestForm extends ControlForm {
  componentDidUpdate(prevProps) {
    // Reset form if the recipe changed
    if (!isEqual(prevProps.revision, this.props.revision)) {
      this.props.form.resetFields();
    }
  }

  render() {
    const FormItem = this.FormItem;
    const { revision, form, readOnly } = this.props;

    return (
      <Form onSubmit={this.handleSubmit}>
        <h2>Review</h2>
        <FormItem
          name="comment"
          label="Comment"
          initialValue={revision.approval_request.comment}
          config={{
            rules: [
              { required: true, message: 'You must enter a comment for this review.' },
            ],
          }}
        >
          <Input type="textarea" readOnly={readOnly} />
        </FormItem>
        {!readOnly &&
          <ApprovalRequestFormActions form={form} revision={revision} />
        }
      </Form>
    );
  }
}

export const WrappedApprovalRequestForm = Form.create({})(ApprovalRequestForm);

@autobind
export class ApprovalRequestFormActions extends React.Component {
  async handleClickCancel() {
    const { revision } = this.props;
    try {
      await api.cancelApprovalRequest(revision.approval_request.id);
      message.success('Cancelled approval request.');
      browserHistory.push(`/control2/recipe/revision/${revision.id}/`);
    } catch (error) {
      message.error(`Failed to cancel approval request: ${error.message}`);
    }
  }

  handleClickReject() {
    const { form, revision } = this.props;
    form.validateFields(async (validationError, values) => {
      if (!validationError) {
        try {
          await api.rejectApprovalRequest(revision.approval_request.id, values);
          message.success('Rejected revision.');
          browserHistory.push(`/control2/recipe/revision/${revision.id}/`);
        } catch (error) {
          message.error(`Failed to reject revision: ${error.message}`);
        }
      }
    });
  }

  handleClickApprove() {
    const { form, revision } = this.props;
    form.validateFields(async (validationError, values) => {
      if (!validationError) {
        try {
          await api.approveApprovalRequest(revision.approval_request.id, values);
          message.success('Approved revision.');
          browserHistory.push(`/control2/recipe/revision/${revision.id}/`);
        } catch (error) {
          message.error(`Failed to approve revision: ${error.message}`);
        }
      }
    });
  }

  render() {
    return (
      <FormActions>
        <FormActions.Primary>
          <Button type="danger" onClick={this.handleClickReject}>Reject</Button>
          <Button type="primary" onClick={this.handleClickApprove}>Approve</Button>
        </FormActions.Primary>
        <FormActions.Secondary>
          <Button type="default" onClick={this.handleClickCancel}>Cancel Review</Button>
        </FormActions.Secondary>
      </FormActions>
    );
  }
}

export default RecipeReviewPage;
