import { Breadcrumb, Button, Checkbox, Dropdown, Table, Pagination, Input } from 'antd';
import autobind from 'autobind-decorator';
import moment from 'moment';
import React, { PropTypes as pt } from 'react';
import { browserHistory } from 'react-router';
import * as localForage from 'localforage';
import { isEmpty, mapObject } from 'underscore';

import api from 'control2/api';
import PageBreadcrumb from 'control2/components/base/PageBreadcrumb';
import LinkButton from 'control2/components/base/LinkButton';
import BooleanIcon from 'control/components/BooleanIcon';
import { updateQuery } from 'control2/utils';
import connectFetch from 'control2/connectFetch';

const COLUMNS_STORAGE_KEY = 'columns.v2';
const DEFAULT_COLUMNS = ['name', 'action', 'enabled', 'lastUpdated'];

@connectFetch({
  defaults: {
    recipes: {
      results: [],
      count: 0,
    },
    columns: DEFAULT_COLUMNS,
  },
  async fetchData({ location }, setData) {
    setData({
      recipes: await api.fetchRecipes({
        page: getPage(location),
        ordering: getOrdering(location),
        text: getSearch(location),
        status: getStatus(location),
      }),
      columns: await localForage.getItem(COLUMNS_STORAGE_KEY) || DEFAULT_COLUMNS,
    });
  },
})
@autobind
export default class RecipeListPage extends React.Component {
  async handleChangeColumns(columns) {
    await localForage.setItem(COLUMNS_STORAGE_KEY, columns);
    this.props.setData({ columns });
  }

  handleChangePage(page) {
    updateQuery({ page });
  }

  render() {
    const { location, recipes, columns } = this.props;

    return (
      <div>
        <PageBreadcrumb>
          <Breadcrumb.Item>Recipes</Breadcrumb.Item>
        </PageBreadcrumb>
        <div className="listing-page">
          <ListActionBar
            searchText={getSearch(location)}
            columns={columns}
            onChangeColumns={this.handleChangeColumns}
          />
          <RecipeList
            className="list"
            recipes={recipes.results}
            ordering={getOrdering(location)}
            status={getStatus(location)}
            columns={columns}
          />
          <Pagination
            className="pagination"
            current={getPage(location)}
            total={recipes.count}
            onChange={this.handleChangePage}
          />
        </div>
      </div>
    );
  }
}

export function getPage(location) {
  return Number.parseInt(location.query.page, 10) || 1;
}

export function getOrdering(location) {
  return location.query.ordering || '-last_updated';
}

export function getSearch(location) {
  return location.query.text || undefined;
}

export function getStatus(location) {
  return location.query.status || undefined;
}

@autobind
export class ListActionBar extends React.Component {
  handleChangeSearch(value) {
    updateQuery({ text: value || undefined });
  }

  render() {
    const { searchText, columns, onChangeColumns } = this.props;
    return (
      <div className="list-action-bar">
        <Input.Search
          className="search"
          placeholder="Search..."
          defaultValue={searchText}
          onSearch={this.handleChangeSearch}
        />
        <ColumnSelector columns={columns} onChange={onChangeColumns} />
        <LinkButton to="/control2/recipe/new/" type="primary">
          New Recipe
          <i className="fa fa-plus" />
        </LinkButton>
      </div>
    );
  }
}

export function ColumnSelector({ columns, onChange }) {
  const menu = (
    <Checkbox.Group
      onChange={onChange}
      options={[
        { label: 'Name', value: 'name' },
        { label: 'Action', value: 'action' },
        { label: 'Enabled', value: 'enabled' },
        { label: 'Last Updated', value: 'lastUpdated' },
      ]}
      defaultValue={columns}
    />
  );

  return (
    <Dropdown overlay={menu}>
      <Button>
        Columns
        <i className="fa fa-columns" />
      </Button>
    </Dropdown>
  );
}

@autobind
export class RecipeList extends React.Component {
  static propTypes = {
    recipes: pt.array.isRequired, // List of recipes from the API
  }

  static columnBuilders = {
    name({ ordering }) {
      return (
        <Table.Column
          title="Name"
          dataIndex="name"
          key="name"
          sorter
          sortOrder={getSortOrder('name', ordering)}
        />
      );
    },

    action() {
      return (
        <Table.Column
          title="Action"
          dataIndex="action"
          key="action"
        />
      );
    },

    enabled({ status }) {
      return (
        <Table.Column
          title="Enabled"
          key="status"
          render={(text, record) => <BooleanIcon value={record.enabled} />}
          filters={[
            { text: 'Enabled', value: 'enabled' },
            { text: 'Disabled', value: 'disabled' },
          ]}
          filteredValue={status}
          filterMultiple={false}
        />
      );
    },

    lastUpdated({ ordering }) {
      return (
        <Table.Column
          title="Last Updated"
          key="last_updated"
          dataIndex="last_updated"
          render={(text, record) => {
            const lastUpdated = moment(record.last_updated);
            return (
              <span title={lastUpdated.format('LLLL')}>
                {lastUpdated.fromNow()}
              </span>
            );
          }}
          sorter
          sortOrder={getSortOrder('last_updated', ordering)}
        />
      );
    },
  }

  handleClickRecipe(recipe) {
    browserHistory.push(`/control2/recipe/${recipe.id}/`);
  }

  handleChangePage(page) {
    updateQuery({ page });
  }

  handleChangeSortFilters(pagination, filters, sorter) {
    const filterParams = mapObject(filters, values => values.join(',') || undefined);

    let ordering;
    if (!isEmpty(sorter)) {
      const prefix = sorter.order === 'ascend' ? '' : '-';
      ordering = prefix + sorter.field;
    }

    updateQuery({
      ordering,
      ...filterParams,
    });
  }

  render() {
    const { recipes, columns, ordering = undefined, className } = this.props;
    return (
      <Table
        className={className}
        dataSource={recipes}
        pagination={false}
        rowKey="id"
        onRowClick={this.handleClickRecipe}
        onChange={this.handleChangeSortFilters}
        ordering={ordering}
      >
        {columns.map(column => RecipeList.columnBuilders[column](this.  props))}
      </Table>
    );
  }
}

function getSortOrder(field, ordering) {
  if (ordering && ordering.endsWith(field)) {
    return ordering.startsWith('-') ? 'descend' : 'ascend';
  }

  return false;
}
