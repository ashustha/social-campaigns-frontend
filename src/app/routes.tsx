import { createBrowserRouter, Navigate } from 'react-router';
import { HomePage } from './components/HomePage';
import { LoginPage } from './components/LoginPage';
import { RegisterPage } from './components/RegisterPage';
import { DashboardPage } from './components/DashboardPage';
import { NewCampaignPage } from './components/NewCampaignPage';
import { CampaignDetailPage } from './components/CampaignDetailPage';
import { AdminLogin } from './admin/pages/AdminLogin';
import { AdminDashboard } from './admin/pages/AdminDashboard';
import { AdminUsers } from './admin/pages/AdminUsers';
import { AdminCampaigns } from './admin/pages/AdminCampaigns';
import { AdminInquiries } from './admin/pages/AdminInquiries';
import { AdminSupports } from './admin/pages/AdminSupports';
import { AdminLayout } from './admin/layout/AdminLayout';
import { AdminRoute } from './admin/routes/AdminRoute';
import { ProtectedRoute } from './components/ProtectedRoute';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <HomePage />,
  },
  {
    path: '/dashboard',
    element: (
      <ProtectedRoute>
        <DashboardPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/campaign/new',
    element: (
      <ProtectedRoute>
        <NewCampaignPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/campaign/:id',
    element: <CampaignDetailPage />,
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/register',
    element: <RegisterPage />,
  },
  {
    path: '/admin/login',
    element: <AdminLogin />,
  },
  {
    path: '/admin',
    element: (
      <AdminRoute>
        <AdminLayout />
      </AdminRoute>
    ),
    children: [
      {
        path: 'dashboard',
        element: <AdminDashboard />,
      },
      {
        path: 'users',
        element: <AdminUsers />,
      },
      {
        path: 'campaigns',
        element: <AdminCampaigns />,
      },
      {
        path: 'inquiries',
        element: <AdminInquiries />,
      },
      {
        path: 'supports',
        element: <AdminSupports />,
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);
