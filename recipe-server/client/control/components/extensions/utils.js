/**
 * window.fetch wrapper that automatically includes headers required by most
 * API requests.
 */
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
