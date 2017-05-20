import { connect as refetchConnect } from 'react-refetch';

export const connect = refetchConnect.defaults({
  credentials: 'same-origin',
  headers: {
    'X-CSRFToken': document.getElementsByTagName('html')[0].dataset.csrf,
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});

export function fetchRevision(revisionId) {
  return {
    url: `/api/v2/recipe_revision/${revisionId}/`,
  };
}

export function fetchActions() {
  return {
    url: '/api/v2/action/',
  };
}

export function fetchRecipes(params) {
  const url = new URL('/api/v2/recipe/', window.location);
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) {
      url.searchParams.set(key, value);
    }
  }

  return {
    url: url.href,
    refreshing: true,
  };
}

export function fetchRecipe(recipeId) {
  return {
    url: `/api/v2/recipe/${recipeId}/`,
  };
}

export function fetchRecipeHistory(recipeId) {
  return {
    url: `/api/v2/recipe/${recipeId}/history/`,
  };
}
