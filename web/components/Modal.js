// components/Modal.js
import React from 'react';

export default function Modal({ open, title, children, onClose }) {
  if (!open) return null;
  return (
    <div style={{
      position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 2000, background: 'rgba(0,0,0,0.6)'
    }}>
      <div style={{ width: 'min(720px,92%)', background: '#0b0b0f', borderRadius: 12, padding: 20, boxShadow: '0 10px 40px rgba(0,0,0,0.7)', border: '1px solid rgba(255,255,255,0.03)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div style={{ fontWeight: 800 }}>{title}</div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: 20, cursor: 'pointer' }}>×</button>
        </div>
        <div>{children}</div>
      </div>
    </div>
  );
}
