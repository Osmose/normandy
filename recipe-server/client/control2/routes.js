import React from 'react';
import { IndexRedirect, IndexRoute, Route } from 'react-router';
import ControlApp from 'control2/components/base/ControlApp';
import NoMatch from 'control2/components/base/NoMatch';
import RecipeCreatePage from 'control2/components/recipes/RecipeCreatePage';
import RecipeEditPage from 'control2/components/recipes/RecipeEditPage';
import RecipeListPage from 'control2/components/recipes/RecipeListPage';
import RecipeViewPage from 'control2/components/recipes/RecipeViewPage';
import RecipeReviewPage from 'control2/components/recipes/RecipeReviewPage';

export default (
  <Route path="/control2/" component={ControlApp}>
    <IndexRedirect to="recipe/" />
    <Route path="recipe/">
      <IndexRoute component={RecipeListPage} />
      <Route path="new/" component={RecipeCreatePage} />
      <Route path="revision/:revisionId/">
        <IndexRoute component={RecipeEditPage} />
        <Route path="review/" component={RecipeReviewPage} />
      </Route>
      <Route path=":recipeId/" component={RecipeViewPage} />
    </Route>
    <Route path="*" component={NoMatch} />
  </Route>
);
