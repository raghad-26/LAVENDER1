import React from 'react';
import './StateMessage.css';

export default function Loader({ text = 'Loading...' }) {
  return (
    <div className="state-msg" role="status">
      <div className="spinner" />
      <p>{text}</p>
    </div>
  );
}
