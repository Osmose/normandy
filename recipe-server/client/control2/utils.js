import { isObject } from 'underscore';
import { browserHistory } from 'react-router';

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

export function updateQuery(params) {
  const url = new URL(document.location);
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined) {
      url.searchParams.delete(key);
    } else {
      url.searchParams.set(key, value);
    }
  }
  browserHistory.push(url.pathname + url.search);
}

export function get(obj, path, defaultValue = undefined) {
  const parts = path.split('.');

  let currentObj = obj;
  for (const key of parts) {
    if (isObject(currentObj) && currentObj.hasOwnProperty(key)) {
      currentObj = currentObj[key];
    } else {
      return defaultValue;
    }
  }

  return currentObj;
}
