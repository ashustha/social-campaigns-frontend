import { Navigate } from 'react-router';
import { isAdminAuthenticated } from '../services/adminAuth';
import type { ReactNode } from 'react';

export function AdminRoute({ children }: { children: ReactNode }) {
  if (!isAdminAuthenticated()) {
    return <Navigate to="/admin/login" replace />;
  }
  return <>{children}</>;
}
