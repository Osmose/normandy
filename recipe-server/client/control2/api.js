export function apiFetch(input, init) {
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

export class ApiError {
  constructor(message, data) {
    this.name = 'ApiError';
    this.message = message;
    this.data = data;
  }
}

export default {
  async fetch(url, options) {
    const response = await apiFetch(url, options);
    if (!response.ok) {
      let message;
      let data;

      try {
        data = await response.json();
        message = data.detail || response.statusText;
      } catch (error) {
        message = error.message;
      }

      throw new ApiError(message);
    }

    return response;
  },

  async createRevision(recipeId, values) {
    const response = await this.fetch(`/api/v2/recipe/${recipeId}/`, {
      method: 'PATCH',
      body: JSON.stringify(values),
    });
    return response.json();
  },

  async createRecipe(values) {
    const response = await this.fetch('/api/v2/recipe/', {
      method: 'POST',
      body: JSON.stringify(values),
    });
    return response.json();
  },

  async requestApproval(revisionId) {
    await this.fetch(`/api/v2/recipe_revision/${revisionId}/request_approval/`, {
      method: 'POST',
    });
  },

  async cancelApprovalRequest(requestId) {
    await this.fetch(`/api/v2/approval_request/${requestId}/close/`, {
      method: 'POST',
    });
  },

  async approveApprovalRequest(requestId, values) {
    await this.fetch(`/api/v2/approval_request/${requestId}/approve/`, {
      method: 'POST',
      body: JSON.stringify(values),
    });
  },

  async rejectApprovalRequest(requestId, values) {
    await this.fetch(`/api/v2/approval_request/${requestId}/reject/`, {
      method: 'POST',
      body: JSON.stringify(values),
    });
  },

  async deleteRecipe(recipeId) {
    await this.fetch(`/api/v2/recipe/${recipeId}/`, {
      method: 'DELETE',
    });
  },

  async enableRecipe(recipeId) {
    const response = await this.fetch(`/api/v2/recipe/${recipeId}/enable/`, {
      method: 'POST',
    });
    return response.json();
  },

  async disableRecipe(recipeId) {
    const response = await this.fetch(`/api/v2/recipe/${recipeId}/disable/`, {
      method: 'POST',
    });
    return response.json();
  },

  async fetchRecipe(recipeId) {
    const response = await this.fetch(`/api/v2/recipe/${recipeId}/`);
    return response.json();
  },

  async fetchRecipes(params) {
    const url = new URL('/api/v2/recipe/', window.location);
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined) {
        url.searchParams.set(key, value);
      }
    }

    const response = await this.fetch(url);
    return response.json();
  },

  async fetchRecipeHistory(recipeId) {
    const response = await this.fetch(`/api/v2/recipe/${recipeId}/history/`);
    return response.json();
  },
};
