import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { getAdminUser, fetchAdminDashboard } from '../services/adminAuth';
import type { AdminDashboardData } from '../services/adminAuth';

export function AdminDashboard() {
  const user = getAdminUser();
  const navigate = useNavigate();
  const [data, setData] = useState<AdminDashboardData | null>(null);

  useEffect(() => {
    fetchAdminDashboard().then(setData);
  }, []);

  const cards = [
    { label: 'Total Users', value: data?.totalUsers, path: '/admin/users' },
    {
      label: 'Total Campaigns',
      value: data?.totalCampaigns,
      path: '/admin/campaigns',
    },
    {
      label: 'Total Inquiries',
      value: data?.totalInquiries,
      path: '/admin/inquiries',
    },
    {
      label: 'Total Supports',
      value: data?.totalSupports,
      path: '/admin/supports',
    },
    {
      label: 'Total Funding',
      value: data ? `$${data.totalFunding}` : undefined,
      path: '/admin/supports',
    },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Dashboard</h1>
      <p className="text-gray-600 mb-8">
        Welcome back, {user?.name || 'Admin'}
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {cards.map((card) => (
          <div
            key={card.label}
            onClick={() => navigate(card.path)}
            className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 cursor-pointer hover:shadow-md hover:border-gray-300 transition-all"
          >
            <h3 className="text-sm font-medium text-gray-500">{card.label}</h3>
            <p className="text-3xl font-bold text-gray-900 mt-2">
              {data === null ? '...' : card.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
