import { UserDashboard } from './UserDashboard';
import { CreateCampaignWizard } from './CreateCampaignWizard';
import { AlertModal } from './AlertModal';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router';

export function DashboardPage() {
  const [showCreateModal, setShowCreateModal] = useState(false);
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
    setShowCreateModal(true);
  };

  const closeCreateModal = () => {
    setShowCreateModal(false);
  };

  const handleCreateSubmit = (formData: any) => {
    // Mock submission - in production, this would call an API
    setAlertMessage(
      `Campaign \"${formData.title}\" has been submitted for review! We'll notify you once it's approved.`,
    );
    setShowAlert(true);
    closeCreateModal();
  };

  return (
    <>
      <UserDashboard onCreateCampaign={handleCreateCampaign} />

      {showCreateModal && (
        <CreateCampaignWizard
          onClose={closeCreateModal}
          onSubmit={handleCreateSubmit}
        />
      )}

      {/* Alert Modal */}
      <AlertModal
        isOpen={showAlert}
        onClose={() => setShowAlert(false)}
        message={alertMessage}
      />
    </>
  );
}
