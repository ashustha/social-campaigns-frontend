import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router';
import { Plus } from 'lucide-react';
import Header from './Header';
import { CampaignCard } from './CampaignCard';
import { ConfirmationModal } from './ConfirmationModal';
import { useEffect, useState } from 'react';
import { fetchCampaigns, type CampaignListItem } from '../services/campaignApi';

const LOCATION_FILTER_OPTIONS = [
  'Melbourne',
  'Sydney',
  'Brisbane',
  'Adelaide',
  'Perth',
];

export function HomePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [campaigns, setCampaigns] = useState<CampaignListItem[]>([]);
  const [campaignsError, setCampaignsError] = useState('');
  const [isLoadingCampaigns, setIsLoadingCampaigns] = useState(true);
  const [filterType, setFilterType] = useState<'all' | 'cause' | 'business'>(
    'all',
  );
  const [filterLocation, setFilterLocation] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 12;

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

  const totalPages = Math.ceil(filteredCampaigns.length / PAGE_SIZE);
  const paginatedCampaigns = filteredCampaigns.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

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

  const handleCreateCampaign = () => {
    if (!user) {
      setShowLoginPrompt(true);
      return;
    }
    navigate('/campaign/new');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Header />

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-10 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-6 md:mb-8">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 md:mb-4">
              Be the Change You Want to See
            </h2>
            <p className="text-base sm:text-lg md:text-xl mb-2 text-blue-100">
              Raise awareness for social causes & promote your small business
            </p>
            <p className="text-sm sm:text-base md:text-lg text-blue-200 mb-5 md:mb-6">
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
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => {
                  setFilterType('all');
                  setCurrentPage(1);
                }}
                className={`px-3 py-1.5 text-sm rounded-lg font-medium transition-colors ${
                  filterType === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                All
              </button>
              <button
                onClick={() => {
                  setFilterType('cause');
                  setCurrentPage(1);
                }}
                className={`px-3 py-1.5 text-sm rounded-lg font-medium transition-colors ${
                  filterType === 'cause'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Social Causes
              </button>
              <button
                onClick={() => {
                  setFilterType('business');
                  setCurrentPage(1);
                }}
                className={`px-3 py-1.5 text-sm rounded-lg font-medium transition-colors ${
                  filterType === 'business'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Small Businesses
              </button>
            </div>

            <div className="flex items-center gap-3">
              <select
                value={filterLocation}
                onChange={(e) => {
                  setFilterLocation(e.target.value);
                  setCurrentPage(1);
                }}
                className="text-sm px-3 py-1.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Locations</option>
                {LOCATION_FILTER_OPTIONS.map((location) => (
                  <option key={location} value={location}>
                    {location}
                  </option>
                ))}
              </select>

              <span className="text-xs sm:text-sm text-gray-600 sm:ml-auto whitespace-nowrap">
                {filteredCampaigns.length} campaign
                {filteredCampaigns.length !== 1 ? 's' : ''}
              </span>
            </div>
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
            {paginatedCampaigns.map((campaign) => (
              <CampaignCard key={campaign.id} campaign={campaign} />
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
                setCurrentPage(1);
              }}
              className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        )}

        {!isLoadingCampaigns && totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-8">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 text-sm rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-3 py-1.5 text-sm rounded-lg font-medium transition-colors ${
                  page === currentPage
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 text-sm rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        )}
      </main>

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
