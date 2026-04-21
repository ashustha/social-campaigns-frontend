import { Navigate } from 'react-router';
import { isAdminAuthenticated, getAdminUser } from '../services/adminAuth';
import type { ReactNode } from 'react';

export function AdminRoute({ children }: { children: ReactNode }) {
  if (!isAdminAuthenticated() || getAdminUser()?.role !== 'admin') {
    return <Navigate to="/admin/login" replace />;
  }
  return <>{children}</>;
}
