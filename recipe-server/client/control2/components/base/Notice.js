import React from 'react';

export default function Notice({ children, icon, message }) {
  return (
    <div className="notice">
      <div className="notice-message">
        <i className={`fa ${icon} fa-3x fa-fw`} />
        <p>{message}</p>
      </div>
      {children}
    </div>
  );
}
