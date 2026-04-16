import { useEffect, useState } from 'react';
import { getAdminUser, fetchAdminDashboard } from '../services/adminAuth';
import type { AdminDashboardData } from '../services/adminAuth';

export function AdminDashboard() {
  const user = getAdminUser();
  const [data, setData] = useState<AdminDashboardData | null>(null);

  useEffect(() => {
    fetchAdminDashboard().then(setData);
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Dashboard</h1>
      <p className="text-gray-600 mb-8">
        Welcome back, {user?.name || 'Admin'}
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <h3 className="text-sm font-medium text-gray-500">Total Users</h3>
          <p className="text-3xl font-bold text-gray-900 mt-2">
            {data === null ? '...' : data.totalUsers}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <h3 className="text-sm font-medium text-gray-500">Total Campaigns</h3>
          <p className="text-3xl font-bold text-gray-900 mt-2">
            {data === null ? '...' : data.totalCampaigns}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <h3 className="text-sm font-medium text-gray-500">Total Inquiries</h3>
          <p className="text-3xl font-bold text-gray-900 mt-2">
            {data === null ? '...' : data.totalInquiries}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <h3 className="text-sm font-medium text-gray-500">Total Supports</h3>
          <p className="text-3xl font-bold text-gray-900 mt-2">
            {data === null ? '...' : data.totalSupports}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <h3 className="text-sm font-medium text-gray-500">Total Funding</h3>
          <p className="text-3xl font-bold text-gray-900 mt-2">
            {data === null ? '...' : `$${data.totalFunding}`}
          </p>
        </div>
      </div>
    </div>
  );
}
