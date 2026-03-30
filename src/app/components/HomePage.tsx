import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router';
import { LogOut, Plus, User, X, LogIn, ChevronDown } from 'lucide-react';
import Header from './Header';
import { CampaignCard } from './CampaignCard';
import { CampaignDetailModal } from './CampaignDetailModal';
import { ConfirmationModal } from './ConfirmationModal';
import { AlertModal } from './AlertModal';
import { useEffect, useState } from 'react';
import { toast } from '../utils/toast';
import {
  fetchCampaigns,
  inquiryCampaign,
  supportCampaign,
  type CampaignListItem,
} from '../services/campaignApi';

const LOCATION_FILTER_OPTIONS = [
  'Melbourne',
  'Sydney',
  'Brisbane',
  'Adelaide',
  'Perth',
];

export function HomePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [showAlert, setShowAlert] = useState(false);
  const [campaigns, setCampaigns] = useState<CampaignListItem[]>([]);
  const [campaignsError, setCampaignsError] = useState('');
  const [isLoadingCampaigns, setIsLoadingCampaigns] = useState(true);
  const [selectedCampaign, setSelectedCampaign] =
    useState<CampaignListItem | null>(null);
  const [showSupportModal, setShowSupportModal] = useState(false);
  const [showLearnMoreModal, setShowLearnMoreModal] = useState(false);
  const [isSubmittingSupport, setIsSubmittingSupport] = useState(false);
  const [isSubmittingInquiry, setIsSubmittingInquiry] = useState(false);
  const [supportForm, setSupportForm] = useState({
    name: '',
    email: '',
    message: '',
    amount: '',
  });
  const [learnMoreForm, setLearnMoreForm] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });
  const [filterType, setFilterType] = useState<'all' | 'cause' | 'business'>(
    'all',
  );
  const [filterLocation, setFilterLocation] = useState<string>('all');

  useEffect(() => {
    let isActive = true;

    async function loadCampaigns() {
      setIsLoadingCampaigns(true);
      setCampaignsError('');

      const response = await fetchCampaigns();
      if (!isActive) {
        return;
      }

      if (!response.success) {
        setCampaigns([]);
        setCampaignsError(response.message);
        setIsLoadingCampaigns(false);
        return;
      }

      setCampaigns(response.data);
      setIsLoadingCampaigns(false);
    }

    void loadCampaigns();

    return () => {
      isActive = false;
    };
  }, []);

  const filteredCampaigns = campaigns.filter((campaign) => {
    const typeMatch = filterType === 'all' || campaign.type === filterType;
    const locationMatch =
      filterLocation === 'all' || campaign.location.includes(filterLocation);
    return typeMatch && locationMatch;
  });

  useEffect(() => {
    if (isLoadingCampaigns) {
      return;
    }

    console.log('All campaigns:', campaigns);
  }, [campaigns, isLoadingCampaigns]);

  useEffect(() => {
    if (isLoadingCampaigns) {
      return;
    }

    console.log('Filtered campaigns:', filteredCampaigns);
  }, [filteredCampaigns, isLoadingCampaigns]);

  const isValidAustralianPhone = (value: string) => {
    const normalizedPhone = value.replace(/[\s()-]/g, '');
    return /^(\+61|0)[2-478]\d{8}$/.test(normalizedPhone);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleSupportCause = () => {
    const storedUser = localStorage.getItem('user');
    let storedName = user?.name ?? '';
    let storedEmail = user?.email ?? '';

    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser) as {
          name?: string;
          email?: string;
        };
        storedName = parsedUser.name ?? storedName;
        storedEmail = parsedUser.email ?? storedEmail;
      } catch {
        // Ignore invalid localStorage payload and use context values.
      }
    }

    setSupportForm((previousForm) => ({
      ...previousForm,
      name: storedName,
      email: storedEmail,
    }));
    setShowSupportModal(true);
  };

  const closeSupportModal = () => {
    setShowSupportModal(false);
    setSupportForm({
      name: '',
      email: '',
      message: '',
      amount: '',
    });
  };

  const handleSupportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedCampaign) {
      return;
    }

    setIsSubmittingSupport(true);

    const response = await supportCampaign(selectedCampaign.id, supportForm);

    setIsSubmittingSupport(false);

    if (!response.success) {
      setAlertMessage(response.message);
      setShowAlert(true);
      return;
    }

    toast.success(
      'Support Submitted',
      response.message ||
        `Thank you for supporting ${selectedCampaign.title}! Your support means everything.`,
    );
    closeSupportModal();
    setSelectedCampaign(null);
  };

  const handleLearnMore = () => {
    const storedUser = localStorage.getItem('user');
    let storedName = user?.name ?? '';
    let storedEmail = user?.email ?? '';

    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser) as {
          name?: string;
          email?: string;
        };
        storedName = parsedUser.name ?? storedName;
        storedEmail = parsedUser.email ?? storedEmail;
      } catch {
        // Ignore invalid localStorage payload and use context values.
      }
    }

    setLearnMoreForm((previousForm) => ({
      ...previousForm,
      name: storedName,
      email: storedEmail,
    }));
    setShowLearnMoreModal(true);
  };

  const closeLearnMoreModal = () => {
    setShowLearnMoreModal(false);
    setLearnMoreForm({
      name: '',
      email: '',
      phone: '',
      message: '',
    });
  };

  const handleLearnMoreSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedCampaign) {
      return;
    }

    if (!isValidAustralianPhone(learnMoreForm.phone)) {
      setAlertMessage(
        'Please enter a valid Australian phone number (e.g. 0412345678 or +61412345678).',
      );
      setShowAlert(true);
      return;
    }

    setIsSubmittingInquiry(true);

    const response = await inquiryCampaign(selectedCampaign.id, learnMoreForm);

    setIsSubmittingInquiry(false);

    if (!response.success) {
      setAlertMessage(response.message);
      setShowAlert(true);
      return;
    }

    toast.success(
      'Inquiry Submitted',
      response.message ||
        `Thank you for your interest in ${selectedCampaign.title}! We'll contact you soon with more information.`,
    );
    closeLearnMoreModal();
    setSelectedCampaign(null);
  };

  const handleCreateCampaign = () => {
    if (!user) {
      setShowLoginPrompt(true);
      return;
    }
    navigate('/campaign/new');
  };

  const handleVoteUpdate = (
    campaignId: string,
    upvotes: number,
    downvotes: number,
  ) => {
    setCampaigns((previousCampaigns) =>
      previousCampaigns.map((campaign) =>
        campaign.id === campaignId
          ? { ...campaign, upvotes, downvotes }
          : campaign,
      ),
    );

    setSelectedCampaign((previousSelectedCampaign) => {
      if (
        !previousSelectedCampaign ||
        previousSelectedCampaign.id !== campaignId
      ) {
        return previousSelectedCampaign;
      }

      return {
        ...previousSelectedCampaign,
        upvotes,
        downvotes,
      };
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Header />

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-4xl font-bold mb-4">
              Be the Change You Want to See
            </h2>
            <p className="text-xl mb-2 text-blue-100">
              Raise awareness for social causes & promote your small business
            </p>
            <p className="text-lg text-blue-200 mb-6">
              Connecting communities across Melbourne, Sydney, Brisbane,
              Adelaide, and Perth
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={handleCreateCampaign}
                className="flex items-center gap-2 px-6 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
              >
                <Plus className="size-5" />
                Create Campaign
              </button>
            </div>
          </div>

          {/* Location Pills */}
          <div className="flex flex-wrap justify-center gap-3">
            <div className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium">
              📍 Melbourne HQ
            </div>
            <div className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium">
              📍 Sydney
            </div>
            <div className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium">
              📍 Brisbane
            </div>
            <div className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium">
              📍 Adelaide
            </div>
            <div className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium">
              📍 Perth
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Active Campaigns
          </h2>
          <p className="text-gray-600 mb-6">
            Discover and support social causes and small businesses making a
            difference
          </p>

          {/* Filters */}
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex gap-2">
              <button
                onClick={() => setFilterType('all')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filterType === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                All Campaigns
              </button>
              <button
                onClick={() => setFilterType('cause')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filterType === 'cause'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Social Causes
              </button>
              <button
                onClick={() => setFilterType('business')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filterType === 'business'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Small Businesses
              </button>
            </div>

            <select
              value={filterLocation}
              onChange={(e) => setFilterLocation(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Locations</option>
              {LOCATION_FILTER_OPTIONS.map((location) => (
                <option key={location} value={location}>
                  {location}
                </option>
              ))}
            </select>

            <span className="text-sm text-gray-600 ml-auto">
              Showing {filteredCampaigns.length} campaign
              {filteredCampaigns.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>

        {campaignsError && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {campaignsError}
          </div>
        )}

        {/* Campaigns Grid */}
        {isLoadingCampaigns ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="h-[420px] animate-pulse rounded-xl bg-white shadow-md"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCampaigns.map((campaign) => (
              <CampaignCard
                key={campaign.id}
                campaign={campaign}
                onReadMore={setSelectedCampaign}
                onVoteUpdate={handleVoteUpdate}
              />
            ))}
          </div>
        )}

        {!isLoadingCampaigns && filteredCampaigns.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              No campaigns found matching your filters.
            </p>
            <button
              onClick={() => {
                setFilterType('all');
                setFilterLocation('all');
              }}
              className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        )}
      </main>

      {/* Campaign Detail Modal */}
      {selectedCampaign && (
        <CampaignDetailModal
          campaign={selectedCampaign}
          onClose={() => setSelectedCampaign(null)}
          onSupportCause={handleSupportCause}
          onLearnMore={handleLearnMore}
          onVoteUpdate={handleVoteUpdate}
        />
      )}

      {/* Support Modal */}
      {showSupportModal && (
        <div
          className="fixed inset-0 bg-black flex items-center justify-center z-50 p-4"
          onClick={closeSupportModal}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center rounded-t-2xl">
              <h2 className="text-2xl font-bold text-gray-900">
                Support {selectedCampaign?.title}
              </h2>
              <button
                onClick={closeSupportModal}
                className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full p-2 transition-colors"
              >
                <X className="size-6" />
              </button>
            </div>

            <div className="p-6">
              <form onSubmit={handleSupportSubmit}>
                <div className="mb-4">
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={supportForm.name}
                    onChange={(e) =>
                      setSupportForm({ ...supportForm, name: e.target.value })
                    }
                    disabled
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={supportForm.email}
                    onChange={(e) =>
                      setSupportForm({ ...supportForm, email: e.target.value })
                    }
                    disabled
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label
                    htmlFor="message"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Message
                  </label>
                  <textarea
                    id="message"
                    value={supportForm.message}
                    onChange={(e) =>
                      setSupportForm({
                        ...supportForm,
                        message: e.target.value,
                      })
                    }
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    rows={4}
                  />
                </div>
                <div className="mb-4">
                  <label
                    htmlFor="amount"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Amount
                  </label>
                  <input
                    type="number"
                    id="amount"
                    value={supportForm.amount}
                    onChange={(e) =>
                      setSupportForm({ ...supportForm, amount: e.target.value })
                    }
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSubmittingSupport}
                  className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                >
                  {isSubmittingSupport ? 'Submitting...' : 'Support This Cause'}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Learn More Modal */}
      {showLearnMoreModal && (
        <div
          className="fixed inset-0 bg-black flex items-center justify-center z-50 p-4"
          onClick={closeLearnMoreModal}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center rounded-t-2xl">
              <h2 className="text-2xl font-bold text-gray-900">
                Learn More About {selectedCampaign?.title}
              </h2>
              <button
                onClick={closeLearnMoreModal}
                className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full p-2 transition-colors"
              >
                <X className="size-6" />
              </button>
            </div>

            <div className="p-6">
              <form onSubmit={handleLearnMoreSubmit}>
                <div className="mb-4">
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={learnMoreForm.name}
                    onChange={(e) =>
                      setLearnMoreForm({
                        ...learnMoreForm,
                        name: e.target.value,
                      })
                    }
                    disabled
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={learnMoreForm.email}
                    onChange={(e) =>
                      setLearnMoreForm({
                        ...learnMoreForm,
                        email: e.target.value,
                      })
                    }
                    disabled
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label
                    htmlFor="phone"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Phone
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    value={learnMoreForm.phone}
                    onChange={(e) =>
                      setLearnMoreForm({
                        ...learnMoreForm,
                        phone: e.target.value,
                      })
                    }
                    placeholder="0412345678 or +61412345678"
                    title="Enter a valid Australian phone number"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label
                    htmlFor="message"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Message
                  </label>
                  <textarea
                    id="message"
                    value={learnMoreForm.message}
                    onChange={(e) =>
                      setLearnMoreForm({
                        ...learnMoreForm,
                        message: e.target.value,
                      })
                    }
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    rows={4}
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSubmittingInquiry}
                  className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                >
                  {isSubmittingInquiry ? 'Submitting...' : 'Submit Inquiry'}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Login Prompt */}
      {showLoginPrompt && (
        <ConfirmationModal
          title="Login Required"
          message="You need to login to create a campaign. Would you like to login now?"
          onConfirm={() => {
            setShowLoginPrompt(false);
            navigate('/login');
          }}
          onCancel={() => setShowLoginPrompt(false)}
        />
      )}

      {/* Alert Modal */}
      {showAlert && (
        <AlertModal
          message={alertMessage}
          onClose={() => setShowAlert(false)}
        />
      )}

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-gray-400">
              Advanced Consulting Services - Connecting communities across
              Melbourne, Sydney, Brisbane, Adelaide, and Perth
            </p>
            <p className="text-gray-500 text-sm mt-2">
              © 2026 Advanced Consulting Services. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
