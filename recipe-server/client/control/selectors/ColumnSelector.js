/**
 * RecipeList column selectors
 */

/**
 * Given a set of columns, returns an array of
 * enabled-only/displayed columns
 *
 * @param  {Array<Object>} columns Initial set of columns to look through
 * @return {Array<Object>}         Columns that are enabled/visible to user
 */
export function getActiveColumns(columns) {
  return [].concat(columns)
    .filter(col => col.enabled);
}

/**
 * Given a set of columns, returns an array of
 * disabled only (hidden) columns
 *
 * @param  {Array<Object>} columns Initial set of columns to look through
 * @return {Array<Object>}         Columns that are disabled/hidden from the user
 */
export function getInactiveColumns(columns) {
  return [].concat(columns)
    .filter(col => !col.enabled);
}
