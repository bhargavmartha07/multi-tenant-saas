import React from 'react';
import '../pages/tenant-admin/Dashboard.css';

export default function Skeleton({ rows = 3, height = 14, style = {} }) {
  return (
    <div style={{ display: 'grid', gap: 8, ...style }}>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="skeleton" style={{ height }} />
      ))}
    </div>
  );
}
