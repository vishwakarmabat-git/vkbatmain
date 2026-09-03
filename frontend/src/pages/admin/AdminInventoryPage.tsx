import React from 'react';
import { Navigate } from 'react-router-dom';

export const AdminInventoryPage: React.FC = () => {
  return <Navigate to="/admin/products" replace />;
};
