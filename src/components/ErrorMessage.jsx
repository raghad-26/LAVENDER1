import React from 'react';
import './StateMessage.css';

export default function ErrorMessage({ message, onRetry }) {
  return (
    <div className="state-msg state-msg--error" role="alert">
      <p>{message}</p>
      {onRetry && (
        <button className="btn btn--primary" onClick={onRetry}>Try again</button>
      )}
    </div>
  );
}
