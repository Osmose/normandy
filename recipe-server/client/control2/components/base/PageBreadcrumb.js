import React from 'react';
import { Breadcrumb } from 'antd';

export default function PageBreadcrumb({ children }) {
  return (
    <Breadcrumb className="page-breadcrumb" separator=">">
      {children}
    </Breadcrumb>
  );
}
