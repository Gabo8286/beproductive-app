import React from 'react';

export const SimpleTest = () => {
  console.log('[SimpleTest] Rendering simple test component');

  return (
    <div style={{
      padding: '20px',
      backgroundColor: '#f0f0f0',
      border: '2px solid #007acc',
      borderRadius: '8px',
      fontSize: '18px',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h1 style={{ color: '#007acc', marginBottom: '10px' }}>
        ✅ React App is Working!
      </h1>
      <p>
        If you can see this message, React is rendering correctly.
      </p>
      <p>
        Current time: {new Date().toLocaleTimeString()}
      </p>
      <div style={{ marginTop: '10px', fontSize: '14px', color: '#666' }}>
        Environment: {import.meta.env.NODE_ENV || 'development'}
      </div>
    </div>
  );
};