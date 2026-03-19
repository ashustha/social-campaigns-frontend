import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router';
import {
  LogOut,
  Plus,
  Trash2,
  ArrowLeft,
  ChevronDown,
  User,
} from 'lucide-react';
import Header from './Header';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { ConfirmationModal } from './ConfirmationModal';
import { AlertModal } from './AlertModal';
import { useState } from 'react';

interface UserCampaign {
  id: string;
  title: string;
  description: string;
  image: string;
  type: 'cause' | 'business';
  category: string;
  status: 'Active' | 'Pending' | 'Completed';
  supporters: string;
  startDate: string;
}

interface UserDashboardProps {
  onCreateCampaign: () => void;
}

export function UserDashboard({ onCreateCampaign }: UserDashboardProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [campaignToDelete, setCampaignToDelete] = useState<string | null>(null);
  const [showAlert, setShowAlert] = useState(false);
  const [campaigns, setCampaigns] = useState<UserCampaign[]>([
    {
      id: '1',
      title: 'Environmental Conservation',
      description:
        'Join our movement to protect natural habitats and promote sustainable living practices in communities across Australia.',
      image:
        'https://images.unsplash.com/photo-1669553228878-bcacc4e49168?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlbnZpcm9ubWVudGFsJTIwY29uc2VydmF0aW9uJTIwbmF0dXJlfGVufDF8fHx8MTc3MTA0ODIzMnww&ixlib=rb-4.1.0&q=80&w=1080',
      type: 'cause',
      category: 'Environment',
      status: 'Active',
      supporters: '3.2K',
      startDate: '2026-01-15',
    },
  ]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleDelete = (campaignId: string) => {
    setCampaignToDelete(campaignId);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (campaignToDelete) {
      setCampaigns(campaigns.filter((c) => c.id !== campaignToDelete));
      setShowAlert(true);
      setShowDeleteModal(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-800';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'Completed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Header
        title="My Dashboard"
        subtitle="Manage your campaigns"
        back={{ position: 'left', to: '/', label: 'Back to Home' }}
      />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">My Campaigns</h2>
            <p className="text-gray-600 mt-1">
              You have {campaigns.length} campaign
              {campaigns.length !== 1 ? 's' : ''}
            </p>
          </div>
          <button
            onClick={onCreateCampaign}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
          >
            <Plus className="size-5" />
            Create New Campaign
          </button>
        </div>

        {campaigns.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <div className="max-w-md mx-auto">
              <div className="bg-blue-100 rounded-full p-6 w-24 h-24 mx-auto mb-4 flex items-center justify-center">
                <Plus className="size-12 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                No campaigns yet
              </h3>
              <p className="text-gray-600 mb-6">
                Start making a difference by creating your first campaign
              </p>
              <button
                onClick={onCreateCampaign}
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
              >
                <Plus className="size-5" />
                Create Your First Campaign
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {campaigns.map((campaign) => (
              <div
                key={campaign.id}
                className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="flex flex-col md:flex-row">
                  {/* Campaign Image */}
                  <div className="relative w-full md:w-64 h-48 flex-shrink-0">
                    <ImageWithFallback
                      src={campaign.image}
                      alt={campaign.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-4 left-4">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-semibold ${
                          campaign.type === 'cause'
                            ? 'bg-blue-500 text-white'
                            : 'bg-purple-500 text-white'
                        }`}
                      >
                        {campaign.type === 'cause'
                          ? 'Social Cause'
                          : 'Small Business'}
                      </span>
                    </div>
                  </div>

                  {/* Campaign Info */}
                  <div className="flex-1 p-6">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-1">
                          {campaign.title}
                        </h3>
                        <div className="flex items-center gap-3">
                          <span className="text-sm text-gray-500">
                            {campaign.category}
                          </span>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                              campaign.status
                            )}`}
                          >
                            {campaign.status}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleDelete(campaign.id)}
                          className="flex items-center gap-1 px-3 py-2 text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                        >
                          <Trash2 className="size-4" />
                          Delete
                        </button>
                      </div>
                    </div>
                    <p className="text-gray-600 mb-4 line-clamp-2">
                      {campaign.description}
                    </p>
                    <div className="flex items-center gap-6 text-sm text-gray-500">
                      <div>
                        <span className="font-semibold text-gray-900">
                          {campaign.supporters}
                        </span>{' '}
                        supporters
                      </div>
                      <div>
                        Started on{' '}
                        <span className="font-semibold text-gray-900">
                          {campaign.startDate}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDelete}
        title="Delete Campaign"
        message="Are you sure you want to delete this campaign?"
      />

      {/* Alert Modal */}
      <AlertModal
        isOpen={showAlert}
        onClose={() => setShowAlert(false)}
        title="Campaign Deleted"
        message="The campaign has been deleted successfully."
      />
    </div>
  );
}
