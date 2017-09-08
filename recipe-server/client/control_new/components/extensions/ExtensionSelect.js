import { Icon, Select, Spin } from 'antd';
import autobind from 'autobind-decorator';
import { List } from 'immutable';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import LoadingOverlay from 'control_new/components/common/LoadingOverlay';
import QueryMultipleExtensions from 'control_new/components/data/QueryMultipleExtensions';
import { getExtensionListing } from 'control_new/state/app/extensions/selectors';
import { isRequestInProgress } from 'control_new/state/app/requests/selectors';

const { OptGroup, Option } = Select;

@connect(
  state => ({
    extensions: getExtensionListing(state),
  }),
)
@autobind
export default class ExtensionSelect extends React.Component {
  static propTypes = {
    disabled: PropTypes.bool,
    extensions: PropTypes.instanceOf(List).isRequired,
    onChange: PropTypes.func,
    size: PropTypes.oneOf(['small', 'large']),
    value: PropTypes.string.isRequired,
  };

  static defaultProps = {
    disabled: false,
    onChange: null,
    size: 'default',
  };

  // Define the commonly-used elements on the class, so they're compiled only once.
  static placeholderElement = (<span><Icon type="search" />{' Search Extensions'}</span>);
  static noOptionsDisplay = (<span>No extensions found!</span>);

  state = {
    search: null,
  };

  updateSearch(search) {
    if (this.searchDebounce) {
      clearTimeout(this.searchDebounce);
    }
    this.searchDebounce = setTimeout(() => {
      this.setState({
        search,
      });
    }, 200);
  }

  render() {
    const { extensions, disabled, onChange, size, value } = this.props;
    const { search } = this.state;
    const { placeholderElement, noOptionsDisplay } = ExtensionSelect;

    const queryFilters = search ? { text: search } : {};
    const groupLabel = search ? 'Search Results' : 'Recently Uploaded';

    return (
      <div>
        <QueryMultipleExtensions filters={queryFilters} pageNumber={1} />
        <Select
          disabled={disabled}
          onChange={onChange}
          size={size}
          filterOption={false}
          placeholder={placeholderElement}
          notFoundContent={noOptionsDisplay}
          onSearch={this.updateSearch}
          showSearch
          value={value}
        >
          {/*
            For search results, we can assume that we'll always be loading just the
            first page, so this request ID is a constant.
          */}
          <LoadingOverlay requestIds="fetch-extensions-page-1">
            <OptGroup label={groupLabel}>
              {extensions.map(item => (
                <Option key={item.get('xpi')}>{item.get('name')}</Option>
              ))}
            </OptGroup>
          </LoadingOverlay>
        </Select>
      </div>
    );
  }
}
