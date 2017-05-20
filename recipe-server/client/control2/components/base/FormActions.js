import React from 'react';

export default function FormActions({ children }) {
  return (
    <div className="form-actions">
      {children}
    </div>
  );
}

FormActions.Primary = function FormActionsPrimary({ children }) {
  return (
    <div className="primary">{children}</div>
  );
};

FormActions.Secondary = function FormActionsSecondary({ children }) {
  return (
    <div className="secondary">{children}</div>
  );
};
