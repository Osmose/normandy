import React from 'react';
import { isEqual } from 'underscore';
import { Form, Input, Select } from 'antd';
import autobind from 'autobind-decorator';

import ControlForm from 'control2/components/base/ControlForm';
import ConsoleLogFields from 'control2/components/recipes/ConsoleLogFields';
import ShowHeartbeatFields from 'control2/components/recipes/ShowHeartbeatFields';

@autobind
export class RecipeForm extends ControlForm {
  static argumentsFields = {
    'console-log': ConsoleLogFields,
    'show-heartbeat': ShowHeartbeatFields,
    //'preference-experiment': PreferenceExperimentFields,
  };

  componentDidUpdate(prevProps) {
    // Reset form if the recipe changed
    if (!isEqual(prevProps.recipe, this.props.recipe)) {
      this.props.form.resetFields();
    }
  }

  render() {
    const FormItem = this.FormItem;
    const { recipe = {}, form, readOnly, formActions } = this.props;

    const selectedAction = form.getFieldValue('action') || recipe.action;
    const ArgumentsFields = RecipeForm.argumentsFields[selectedAction];

    return (
      <Form onSubmit={this.handleSubmit}>
        <FormItem
          name="name"
          label="Name"
          initialValue={recipe.name}
        >
          <Input readOnly={readOnly} />
        </FormItem>
        <FormItem
          name="extra_filter_expression"
          label="Filter Expression"
          initialValue={recipe.extra_filter_expression}
        >
          <Input type="textarea" readOnly={readOnly} />
        </FormItem>
        <FormItem
          name="action"
          label="Action"
          initialValue={recipe.action}
        >
          <Select disabled={readOnly} placeholder="Select an action...">
            <Select.Option value="console-log">console-log</Select.Option>
            <Select.Option value="show-heartbeat">show-heartbeat</Select.Option>
            <Select.Option value="preference-experiment">preference-experiment</Select.Option>
          </Select>
        </FormItem>
        {ArgumentsFields && (
          <fieldset>
            <legend>Arguments</legend>
            <ArgumentsFields
              FormItem={this.FormItem}
              recipeArguments={recipe.arguments}
              form={form}
              readOnly={readOnly}
            />
          </fieldset>
        )}
        {formActions &&
          React.cloneElement(formActions, { triggerSubmit: this.triggerSubmit })
        }
      </Form>
    );
  }
}

export default Form.create({})(RecipeForm);
