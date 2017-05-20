import React from 'react';
import { browserHistory } from 'react-router';
import { Button } from 'antd';

export default class LinkButton extends React.Component {
  constructor(props) {
    super(props);
    this.handleClick = ::this.handleClick;
  }

  handleClick() {
    browserHistory.push(this.props.to)
  }

  render() {
    const { children, ...props } = this.props;
    return (
      <Button onClick={this.handleClick} {...props}>{children}</Button>
    );
  }
}
