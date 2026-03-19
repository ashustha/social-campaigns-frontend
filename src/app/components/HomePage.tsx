import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router';
import { LogOut, Plus, User, X, LogIn, ChevronDown } from 'lucide-react';
import Header from './Header';
import { CampaignCard } from './CampaignCard';
import { CampaignDetailModal } from './CampaignDetailModal';
import { CreateCampaignWizard } from './CreateCampaignWizard';
import { ConfirmationModal } from './ConfirmationModal';
import { AlertModal } from './AlertModal';
import { useState } from 'react';

const socialCauses = [
  {
    id: '1',
    title: 'Environmental Conservation',
    description:
      'Join our movement to protect natural habitats and promote sustainable living practices in communities across Australia.',
    fullDescription:
      "Our environmental conservation campaign is dedicated to protecting Australia's unique ecosystems and wildlife. We work with local communities to implement sustainable practices, reduce carbon footprints, and preserve natural habitats for future generations. Through education, advocacy, and hands-on conservation projects, we're making a real difference in combating climate change and protecting biodiversity.",
    image:
      'https://images.unsplash.com/photo-1669553228878-bcacc4e49168?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlbnZpcm9ubWVudGFsJTIwY29uc2VydmF0aW9uJTIwbmF0dXJlfGVufDF8fHx8MTc3MTA0ODIzMnww&ixlib=rb-4.1.0&q=80&w=1080',
    status: 'Active',
    supporters: '3.2K',
    type: 'cause' as const,
    category: 'Environment',
    startDate: '2026-01-15',
    location: 'Melbourne, VIC',
    contact: 'environment@advancedconsulting.com.au',
    goals: [
      'Plant 10,000 trees by end of 2026',
      'Reduce local carbon emissions by 20%',
      'Engage 5,000 community volunteers',
    ],
    upvotes: 245,
    downvotes: 12,
  },
  {
    id: '2',
    title: 'Community Volunteering Initiative',
    description:
      'Help build stronger communities by volunteering your time and skills to support those in need across Melbourne and regional areas.',
    fullDescription:
      "The Community Volunteering Initiative connects passionate individuals with meaningful opportunities to make a difference. Whether you're helping at food banks, mentoring youth, or supporting elderly residents, your contribution matters. We coordinate volunteer efforts across multiple cities, ensuring that help reaches those who need it most while building stronger, more connected communities.",
    image:
      'https://images.unsplash.com/photo-1761666507437-9fb5a6ef7b0a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb21tdW5pdHklMjB2b2x1bnRlZXJpbmclMjBoZWxwaW5nfGVufDF8fHx8MTc3MTE0MjI5NHww&ixlib=rb-4.1.0&q=80&w=1080',
    status: 'Active',
    supporters: '5.8K',
    type: 'cause' as const,
    category: 'Community',
    startDate: '2026-02-01',
    location: 'Melbourne & Regional VIC',
    contact: 'volunteer@advancedconsulting.com.au',
    goals: [
      'Match 1,000 volunteers with opportunities',
      'Support 50 community organizations',
      'Distribute 10,000 meals to those in need',
    ],
    upvotes: 387,
    downvotes: 23,
  },
  {
    id: '3',
    title: 'Education for All Children',
    description:
      'Support equal access to quality education for children from all backgrounds. Every child deserves the opportunity to learn and grow.',
    fullDescription:
      "Education is the foundation of a better future. Our campaign provides resources, tutoring, and learning materials to underprivileged children across Australia. We believe every child, regardless of their background or circumstances, deserves access to quality education. Through partnerships with schools, libraries, and community centers, we're breaking down barriers to learning and creating opportunities for all.",
    image:
      'https://images.unsplash.com/photo-1765223111660-cdf94396832a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlZHVjYXRpb24lMjBjaGlsZHJlbiUyMGxlYXJuaW5nfGVufDF8fHx8MTc3MTA4NDQzNXww&ixlib=rb-4.1.0&q=80&w=1080',
    status: 'Active',
    supporters: '7.1K',
    type: 'cause' as const,
    category: 'Education',
    startDate: '2026-01-20',
    location: 'Sydney, NSW',
    contact: 'education@advancedconsulting.com.au',
    goals: [
      'Provide learning materials to 2,000 students',
      'Establish 15 community tutoring programs',
      'Award 50 scholarships to deserving students',
    ],
    upvotes: 512,
    downvotes: 31,
  },
  {
    id: '4',
    title: 'Local Coffee Roastery - Fresh Beans',
    description:
      'Small family-owned coffee roastery in Sydney offering ethically sourced, freshly roasted beans. Supporting local farmers and sustainable practices.',
    fullDescription:
      "Family-owned and operated since 2020, our coffee roastery is committed to excellence and sustainability. We source our beans directly from ethical farms, ensuring fair wages for farmers while delivering exceptional quality to our customers. Every batch is carefully roasted to perfection, bringing out unique flavor profiles. We're not just selling coffee - we're building relationships with our community and supporting sustainable agriculture worldwide.",
    image:
      'https://images.unsplash.com/photo-1761783536272-2fb78dd52c76?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsb2NhbCUyMHNtYWxsJTIwYnVzaW5lc3MlMjBvd25lcnxlbnwxfHx8fDE3NzExNDIyOTR8MA&ixlib=rb-4.1.0&q=80&w=1080',
    status: 'Active',
    supporters: '1.2K',
    type: 'business' as const,
    category: 'Food & Beverage',
    startDate: '2026-02-10',
    location: 'Sydney, NSW',
    contact: 'hello@freshbeansroastery.com.au',
    goals: [
      'Expand to 3 new locations',
      'Partner with 10 local cafes',
      'Launch online subscription service',
    ],
    upvotes: 156,
    downvotes: 8,
  },
  {
    id: '5',
    title: 'Social Justice & Equality',
    description:
      'Advocating for equal rights and opportunities for all members of society. Stand with us to create a more just and inclusive world.',
    fullDescription:
      'Social justice begins with awareness and action. Our campaign advocates for equal rights, opportunities, and treatment for all people regardless of race, gender, religion, or background. We work to address systemic inequalities through education, policy advocacy, and community organizing. Join us in building a society where everyone has a fair chance to succeed and thrive.',
    image:
      'https://images.unsplash.com/photo-1759171907618-95130c76ae5e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzb2NpYWwlMjBqdXN0aWNlJTIwZXF1YWxpdHl8ZW58MXx8fHwxNzcxMTQyMjk1fDA&ixlib=rb-4.1.0&q=80&w=1080',
    status: 'Active',
    supporters: '9.4K',
    type: 'cause' as const,
    category: 'Social Justice',
    startDate: '2026-01-10',
    location: 'Brisbane, QLD',
    contact: 'justice@advancedconsulting.com.au',
    goals: [
      'Host 20 community awareness events',
      'Advocate for 5 policy changes',
      'Provide legal aid to 100 individuals',
    ],
    upvotes: 624,
    downvotes: 45,
  },
  {
    id: '6',
    title: 'Mental Health & Wellness',
    description:
      'Promoting mental health awareness and providing resources for those struggling. Together we can break the stigma and support healing.',
    fullDescription:
      "Mental health matters. Our campaign works to destigmatize mental health challenges and provide accessible resources for those in need. Through support groups, counseling services, and educational programs, we're creating a culture where seeking help is encouraged and supported. Mental wellness is essential to overall health, and we're committed to making mental health services available to everyone who needs them.",
    image:
      'https://images.unsplash.com/photo-1770223722037-8dc5d3dff8d3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoZWFsdGglMjB3ZWxsbmVzcyUyMGNvbW11bml0eXxlbnwxfHx8fDE3NzExNDIyOTZ8MA&ixlib=rb-4.1.0&q=80&w=1080',
    status: 'Active',
    supporters: '6.3K',
    type: 'cause' as const,
    category: 'Health',
    startDate: '2026-02-05',
    location: 'Adelaide, SA',
    contact: 'wellness@advancedconsulting.com.au',
    goals: [
      'Establish 10 support groups',
      'Provide free counseling to 500 people',
      'Train 100 mental health first aiders',
    ],
    upvotes: 432,
    downvotes: 19,
  },
  {
    id: '7',
    title: 'Green Thumb Landscaping Services',
    description:
      'Professional landscaping and garden design services in Perth. Transforming outdoor spaces into beautiful, sustainable gardens.',
    fullDescription:
      'With over 15 years of experience, Green Thumb Landscaping specializes in creating stunning outdoor environments that are both beautiful and environmentally sustainable. We offer comprehensive services including garden design, installation, and maintenance. Our team is passionate about using native plants and water-efficient designs to create spaces that thrive in the Australian climate while supporting local ecosystems.',
    image:
      'https://images.unsplash.com/photo-1558904541-efa843a96f01?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsYW5kc2NhcGluZyUyMGdhcmRlbiUyMHNlcnZpY2V8ZW58MXx8fHwxNzQwMDYzNTQ1fDA&ixlib=rb-4.1.0&q=80&w=1080',
    status: 'Active',
    supporters: '892',
    type: 'business' as const,
    category: 'Home Services',
    startDate: '2026-02-12',
    location: 'Perth, WA',
    contact: 'info@greenthumbperth.com.au',
    goals: [
      'Complete 100 residential projects',
      'Hire 5 new team members',
      'Win local business award',
    ],
    upvotes: 123,
    downvotes: 7,
  },
  {
    id: '8',
    title: 'TechStart IT Solutions',
    description:
      'Brisbane-based IT consulting firm helping small businesses with technology solutions, cybersecurity, and cloud services.',
    fullDescription:
      'TechStart IT Solutions provides comprehensive technology services to small and medium-sized businesses across Queensland. We specialize in managed IT services, cybersecurity, cloud migration, and digital transformation. Our mission is to make enterprise-level technology accessible and affordable for growing businesses, helping them compete in the digital economy while keeping their data secure.',
    image:
      'https://images.unsplash.com/photo-1551434678-e076c223a692?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpdCUyMGNvbnN1bHRpbmclMjB0ZWNobm9sb2d5fGVufDF8fHx8MTc0MDA2MzU0NXww&ixlib=rb-4.1.0&q=80&w=1080',
    status: 'Active',
    supporters: '1.5K',
    type: 'business' as const,
    category: 'Technology',
    startDate: '2026-01-25',
    location: 'Brisbane, QLD',
    contact: 'hello@techstartit.com.au',
    goals: [
      'Onboard 50 new clients',
      'Launch cybersecurity training program',
      'Open second office in Gold Coast',
    ],
    upvotes: 198,
    downvotes: 11,
  },
  {
    id: '9',
    title: 'Artisan Bakery & Café',
    description:
      'Handcrafted sourdough bread and pastries made fresh daily in our Melbourne bakery. Supporting local farmers and traditional baking methods.',
    fullDescription:
      'Our artisan bakery brings the time-honored tradition of European baking to Melbourne. We use only the finest organic ingredients sourced from local Victorian farmers, and every loaf is hand-shaped and naturally leavened. Our commitment to quality extends beyond bread - we create a welcoming community space where neighbors gather, relationships form, and the simple pleasure of good food brings people together.',
    image:
      'https://images.unsplash.com/photo-1509440159596-0249088772ff?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiYWtlcnklMjBhcnRpc2FuJTIwYnJlYWR8ZW58MXx8fHwxNzQwMDYzNTQ1fDA&ixlib=rb-4.1.0&q=80&w=1080',
    status: 'Active',
    supporters: '2.1K',
    type: 'business' as const,
    category: 'Food & Beverage',
    startDate: '2026-02-08',
    location: 'Melbourne, VIC',
    contact: 'orders@artisanbakery.com.au',
    goals: [
      'Expand wholesale to 20 cafés',
      'Launch baking workshops',
      'Open second location in Carlton',
    ],
    upvotes: 267,
    downvotes: 9,
  },
];

export function HomePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showConfirmCreateModal, setShowConfirmCreateModal] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [showAlert, setShowAlert] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<
    (typeof socialCauses)[0] | null
  >(null);
  const [showSupportModal, setShowSupportModal] = useState(false);
  const [showLearnMoreModal, setShowLearnMoreModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
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
    'all'
  );
  const [filterLocation, setFilterLocation] = useState<string>('all');

  const filteredCampaigns = socialCauses.filter((campaign) => {
    const typeMatch = filterType === 'all' || campaign.type === filterType;
    const locationMatch =
      filterLocation === 'all' || campaign.location.includes(filterLocation);
    return typeMatch && locationMatch;
  });

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleSupportCause = () => {
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

  const handleSupportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAlertMessage(
      `Thank you for supporting ${selectedCampaign?.title}! Your support means everything.`
    );
    setShowAlert(true);
    closeSupportModal();
    setSelectedCampaign(null);
  };

  const handleLearnMore = () => {
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

  const handleLearnMoreSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAlertMessage(
      `Thank you for your interest in ${selectedCampaign?.title}! We'll contact you soon with more information.`
    );
    setShowAlert(true);
    closeLearnMoreModal();
    setSelectedCampaign(null);
  };

  const handleCreateSubmit = (formData: any) => {
    setAlertMessage(
      `Campaign "${formData.title}" has been submitted for review! We'll notify you once it's approved.`
    );
    setShowAlert(true);
    setShowCreateModal(false);
  };

  const handleCreateCampaign = () => {
    if (!user) {
      setShowLoginPrompt(true);
      return;
    }
    setShowConfirmCreateModal(true);
  };

  const handleConfirmCreate = () => {
    setShowConfirmCreateModal(false);
    setShowCreateModal(true);
  };

  const handleCancelCreate = () => {
    setShowConfirmCreateModal(false);
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
              <option value="Melbourne">Melbourne</option>
              <option value="Sydney">Sydney</option>
              <option value="Brisbane">Brisbane</option>
              <option value="Adelaide">Adelaide</option>
              <option value="Perth">Perth</option>
            </select>

            <span className="text-sm text-gray-600 ml-auto">
              Showing {filteredCampaigns.length} campaign
              {filteredCampaigns.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>

        {/* Campaigns Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCampaigns.map((campaign) => (
            <CampaignCard
              key={campaign.id}
              campaign={campaign}
              onReadMore={setSelectedCampaign}
            />
          ))}
        </div>

        {filteredCampaigns.length === 0 && (
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
                  className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                >
                  Support This Cause
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
                  className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                >
                  Submit Inquiry
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Create Campaign Wizard */}
      {showCreateModal && (
        <CreateCampaignWizard
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateSubmit}
        />
      )}

      {/* Confirmation Modal */}
      {showConfirmCreateModal && (
        <ConfirmationModal
          title="Create Campaign"
          message="Are you sure you want to create a new campaign? This will take you to the campaign creation wizard."
          onConfirm={handleConfirmCreate}
          onCancel={handleCancelCreate}
        />
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
