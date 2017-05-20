import React from 'react';
import { browserHistory, Link } from 'react-router';
import { Breadcrumb, Button, message, Popconfirm } from 'antd';
import autobind from 'autobind-decorator';
import { PromiseState } from 'react-refetch';

import api from 'control2/api';
import * as refetch from 'control2/refetch';
import { get } from 'control2/utils';
import LoadingOverlay from 'control2/components/base/LoadingOverlay';
import RecipeHistory from 'control2/components/recipes/RecipeHistory';
import LinkButton from 'control2/components/base/LinkButton';

export function _RecipeViewPage({ recipeFetch, historyFetch, setRecipe }) {
  const allFetches = PromiseState.all([recipeFetch, historyFetch]);
  return (
    <LoadingOverlay promiseState={allFetches}>
      {allFetches.fulfilled &&
        <div>
          <RecipeViewBreadcrumb recipe={recipeFetch.value} />
          <div className="view-page">
            <RecipeView recipe={recipeFetch.value} setRecipe={setRecipe} />
            <RecipeHistory history={historyFetch.value} />
          </div>
        </div>
      }
    </LoadingOverlay>
  );
}

const RecipeViewPage = refetch.connect(props => {
  const { params } = props;

  return {
    recipeFetch: refetch.fetchRecipe(params.recipeId),
    historyFetch: refetch.fetchRecipeHistory(params.recipeId),

    setRecipe(recipe) {
      return {
        recipeFetch: { value: recipe, refreshing: true },
        historyFetch: { value: api.fetchRecipeHistory(recipe.id), refreshing: true },
      };
    },
  };
})(_RecipeViewPage);

export function RecipeViewBreadcrumb({ recipe }) {
  return (
    <Breadcrumb className="page-breadcrumb" separator=">">
      <Breadcrumb.Item><Link to="/control2/recipe/">Recipes</Link></Breadcrumb.Item>
      {recipe &&
        <Breadcrumb.Item>
          {recipe.name}
        </Breadcrumb.Item>
      }
    </Breadcrumb>
  );
}

export function RecipeView({ recipe, setRecipe }) {
  const needsReview = get(recipe, 'latest_revision.approval_request.approved') === null;
  return (
    <div className="recipe-view">
      <div className="actions">
        <h3>Actions</h3>
        {!recipe.enabled && recipe.approved_revision &&
          <PublishAction recipe={recipe} setRecipe={setRecipe} />
        }
        {recipe.enabled &&
          <DisableAction recipe={recipe} setRecipe={setRecipe} />
        }
        {needsReview && <ReviewAction recipe={recipe} />}
        <EditAction recipe={recipe} />
        <DeleteAction recipe={recipe} />
      </div>

      <h2>Recipe: {recipe.name}</h2>
    </div>
  );
}

@autobind
export class PublishAction extends React.Component {
  async handleConfirm() {
    const recipeId = this.props.recipe.id;
    try {
      const recipe = await api.enableRecipe(recipeId);
      message.success(`Enabled ${recipe.name}.`);
      this.props.setRecipe(recipe);
    } catch (error) {
      message.error(`Could not enable recipe: ${error.message}`);
    }
  }

  render() {
    const { recipe } = this.props;
    const revision = recipe.approved_revision;
    const confirmMessage = (
      <span>
        Are you sure you want to publish
        <Link to={`/control2/recipe/revision/${revision.id}/`}>
          {revision.id.slice(0, 7)}
        </Link>
        ?
      </span>
    );

    return (
      <Popconfirm
        title={confirmMessage}
        okText="Publish"
        cancelText="Nevermind"
        onConfirm={this.handleConfirm}
      >
        <Button type="primary">Publish Recipe</Button>
      </Popconfirm>
    );
  }
}

@autobind
export class DisableAction extends React.Component {
  async handleConfirm() {
    const recipeId = this.props.recipe.id;
    try {
      const recipe = await api.disableRecipe(recipeId);
      message.success(`Enabled ${recipe.name}.`);
      this.props.setRecipe(recipe);
    } catch (error) {
      message.error(`Could not disable recipe: ${error.message}`);
    }
  }

  render() {
    return (
      <Popconfirm
        title="Are you sure you want to disable this recipe?"
        okText="Disable"
        cancelText="Nevermind"
        onConfirm={this.handleConfirm}
      >
        <Button type="danger">Disable Recipe</Button>
      </Popconfirm>
    );
  }
}

export function ReviewAction({ recipe }) {
  return (
    <LinkButton
      to={`/control2/recipe/revision/${recipe.latest_revision.id}/review/`}
      type="primary"
    >
      Review Recipe
    </LinkButton>
  );
}

export function EditAction({ recipe }) {
  return (
    <LinkButton to={`/control2/recipe/revision/${recipe.latest_revision.id}/`}>
      Edit Recipe
    </LinkButton>
  );
}

@autobind
export class DeleteAction extends React.Component {
  async handleConfirm() {
    try {
      await api.deleteRecipe(this.props.recipe.id);
      message.success('Deleted recipe successfully.');
      browserHistory.push('/control2/recipe/');
    } catch (error) {
      message.error(`Could not delete recipe: ${error.message}`);
    }
  }

  render() {
    return (
      <Popconfirm
        title="Are you sure you want to delete this recipe?"
        onConfirm={this.handleConfirm}
      >
        <Button type="danger">
          Delete Recipe
        </Button>
      </Popconfirm>
    );
  }
}

export default RecipeViewPage;
