import { UserDashboard } from './UserDashboard';
import { AlertModal } from './AlertModal';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router';

export function DashboardPage() {
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    navigate('/login', { replace: true });
    return null;
  }

  const handleCreateCampaign = () => {
    navigate('/campaign/new');
  };

  return (
    <>
      <UserDashboard onCreateCampaign={handleCreateCampaign} />

      {/* Alert Modal */}
      <AlertModal
        isOpen={showAlert}
        onClose={() => setShowAlert(false)}
        message={alertMessage}
      />
    </>
  );
}
