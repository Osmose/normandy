import React from 'react';
import Notice from 'control2/components/base/Notice';

export default function LoadingOverlay({ children, loading, error }) {
  if (loading) {
    return (
      <Notice icon="fa-spinner fa-spin" message="Loading...">
        {children}
      </Notice>
    );
  } else if (error) {
    return (
      <Notice
        icon="fa-exclamation-triangle"
        message={`Could not load data: ${error}`}
      >
        {children}
      </Notice>
    );
  }

  return <div>{children}</div>;
}
