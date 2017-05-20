import React from 'react';
import { Form } from 'antd';
import autobind from 'autobind-decorator';

/**
 * Base class for control interface forms that handles displaying errors
 * from the API.
 */
export default class ControlForm extends React.Component {
  @autobind
  handleSubmit(event) {
    event.preventDefault();
    this.triggerSubmit();
  }

  @autobind
  triggerSubmit() {
    this.props.form.validateFields((error, values) => {
      if (!error) {
        this.props.onSubmit(values);
      }
    });
  }

  @autobind
  FormItem({ children, name, initialValue, config = {}, ...customItemProps }) {
    const { form, errors = {} } = this.props;

    const defaultItemProps = {};
    if (errors[name]) {
      defaultItemProps.help = errors[name];
      defaultItemProps.validateStatus = 'error';
    }
    const itemProps = { ...defaultItemProps, ...customItemProps };

    const field = form.getFieldDecorator(name, {
      initialValue,
      ...config,
    })(children);

    return (
      <Form.Item {...itemProps}>
        {field}
      </Form.Item>
    );
  }
}
