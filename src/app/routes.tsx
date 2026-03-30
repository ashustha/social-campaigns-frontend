import { createBrowserRouter, Navigate } from 'react-router';
import { HomePage } from './components/HomePage';
import { LoginPage } from './components/LoginPage';
import { RegisterPage } from './components/RegisterPage';
import { DashboardPage } from './components/DashboardPage';
import { NewCampaignPage } from './components/NewCampaignPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <HomePage />,
  },
  {
    path: '/dashboard',
    element: <DashboardPage />,
  },
  {
    path: '/campaign/new',
    element: <NewCampaignPage />,
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
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);
