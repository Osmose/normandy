import React from 'react';
import ReactDOM from 'react-dom';
import { browserHistory, Router } from 'react-router';
import { message } from 'antd';

import 'control2/sass/control.scss';

import routes from 'control2/routes';

// Configure ant-design
message.config({
  duration: 3,
});

// Initialize the control app and render it.
ReactDOM.render(
  <Router history={browserHistory}>
    {routes}
  </Router>,
  document.querySelector('#control-app'),
);
