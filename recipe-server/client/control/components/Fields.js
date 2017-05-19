import React, { PropTypes as pt } from 'react';
import { Field } from 'redux-form';

/**
 * redux-form Field component that wraps the form input in a label and error
 * message container.
 *
 * See buildControlField for supported props.
 */
export function ControlField({ component, ...args }) {
  return <Field component={buildControlField} InputComponent={component} {...args} />;
}
ControlField.propTypes = {
  component: pt.oneOfType([pt.func, pt.string]).isRequired,
};

/**
 * Builds the React component that is rendered for ControlField.
 */
export function buildControlField({
  input,
  meta: { error },
  label,
  className = '',
  InputComponent,
  hideErrors = false,
  children,
  ...args // eslint-disable-line comma-dangle
}) {
  return (
    <label className={`${className} form-field`}>
      <span className="label">{label}</span>
      {!hideErrors && error && <span className="error">{error}</span>}
      <InputComponent {...input} {...args}>
        {children}
      </InputComponent>
    </label>
  );
}
buildControlField.propTypes = {
  input: pt.object.isRequired,
  meta: pt.shape({
    error: pt.oneOfType([pt.string, pt.array]),
  }).isRequired,
  label: pt.string.isRequired,
  className: pt.string,
  InputComponent: pt.oneOfType([pt.func, pt.string]),
  hideErrors: pt.bool,
  children: pt.node,
};

export class IntegerControlField extends React.Component {
  parse(value) {
    return Number.parseInt(value, 10);
  }

  render() {
    return (
      <ControlField
        component="input"
        type="number"
        step="1"
        parse={this.parse}
        {...this.props}
      />
    );
  }
}

export class BooleanRadioControlField extends React.Component {
  parse(value) {
    return value === 'true';
  }

  format(value) {
    if (value) {
      return 'true';
    } else if (value !== undefined) {
      return 'false';
    }
    return undefined;
  }

  render() {
    return (
      <ControlField
        component="input"
        type="radio"
        className="radio-field"
        parse={this.parse}
        format={this.format}
        {...this.props}
      />
    );
  }
}

export function ErrorMessageField(props) {
  return <Field component={buildErrorMessageField} {...props} />;
}

export function buildErrorMessageField({ meta: { error } }) {
  if (error) {
    return <span className="error">{error}</span>;
  }
  return null;
}
buildErrorMessageField.propTypes = {
  meta: pt.shape({
    error: pt.oneOfType([pt.string, pt.array]),
  }).isRequired,
};

export class FileInput extends React.Component {

}
