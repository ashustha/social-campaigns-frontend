import { Outlet } from 'react-router';
import { AdminSidebar } from '../components/AdminSidebar';

export function AdminLayout() {
  return (
    <div className="flex min-h-screen bg-gray-100">
      <AdminSidebar />
      <main className="flex-1 p-8">
        <Outlet />
      </main>
    </div>
  );
}
