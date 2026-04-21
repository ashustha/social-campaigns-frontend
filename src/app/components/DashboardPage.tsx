import { UserDashboard } from './UserDashboard';
import { AlertModal } from './AlertModal';
import { useState } from 'react';
import { useNavigate } from 'react-router';

export function DashboardPage() {
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const navigate = useNavigate();

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
