import React from 'react';
import { Input } from 'antd';

export default function ConsoleLogFields({ FormItem, recipeArguments = {}, readOnly = false }) {
  return (
    <div>
      <p>Log a message to the console.</p>
      <FormItem name="arguments.message" label="Message" initialValue={recipeArguments.message}>
        <Input readOnly={readOnly} />
      </FormItem>
    </div>
  );
}
