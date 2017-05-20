import React from 'react';
import { Checkbox, Input, InputNumber, Select } from 'antd';

export default function ShowHeartbeatFields({ FormItem, recipeArguments = {}, form, readOnly }) {
  return (
    <div>
      <p>Shows a single message or survey prompt to the user.</p>
      <FormItem
        label="Survey ID"
        name="arguments.surveyId"
        initialValue={recipeArguments.surveyId}
      >
        <Input readOnly={readOnly} />
      </FormItem>

      <FormItem
        label="Message"
        name="arguments.message"
        initialValue={recipeArguments.message}
      >
        <Input readOnly={readOnly} />
      </FormItem>

      <FormItem
        label="Engagement Button Label"
        name="arguments.engagementButtonLabel"
        initialValue={recipeArguments.engagementButtonLabel}
      >
        <Input readOnly={readOnly} />
      </FormItem>

      <FormItem
        label="Thanks Message"
        name="arguments.thanksMessage"
        initialValue={recipeArguments.thanksMessage}
      >
        <Input readOnly={readOnly} />
      </FormItem>

      <FormItem
        label="Post-Answer URL"
        name="arguments.postAnswerUrl"
        initialValue={recipeArguments.postAnswerUrl}
      >
        <Input readOnly={readOnly} />
      </FormItem>

      <FormItem
        label="Learn More Message"
        name="arguments.learnMoreMessage"
        initialValue={recipeArguments.learnMoreMessage}
      >
        <Input readOnly={readOnly} />
      </FormItem>

      <FormItem
        label="Learn More URL"
        name="arguments.learnMoreUrl"
        initialValue={recipeArguments.learnMoreUrl}
      >
        <Input readOnly={readOnly} />
      </FormItem>

      <FormItem
        label="How often should the prompt be shown?"
        name="arguments.repeatOption"
        initialValue={recipeArguments.repeatOption || 'once'}
      >
        <Select disabled={readOnly}>
          <Select.Option value="once">
            Do not show this prompt to users more than once.
          </Select.Option>
          <Select.Option value="nag">
            Show this prompt until the user clicks the button/stars,
            and then never again.
          </Select.Option>
          <Select.Option value="xdays">
            Allow re-prompting users who have already seen this prompt
            after {form.getFieldValue('arguments.repeatEvery') || 'X'}
            days since they last saw it.
          </Select.Option>
        </Select>
      </FormItem>

      {form.getFieldValue('arguments.repeatOption') === 'xdays' &&
        <FormItem
          label="Days before user is re-prompted"
          name="arguments.repeatEvery"
          initialValue={recipeArguments.repeatEvery}
        >
          <InputNumber readOnly={readOnly} />
        </FormItem>
      }

      <FormItem
        name="arguments.includeTelemetryUUID"
        initialValue={recipeArguments.includeTelemetryUUID}
      >
        <Checkbox readOnly={readOnly}>
          Include unique user ID in Post-Answer URL (and Telemetry)
        </Checkbox>
      </FormItem>
    </div>
  );
}
