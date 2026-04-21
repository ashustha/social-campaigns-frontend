import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import {
  Users,
  Calendar,
  MapPin,
  Mail,
  Target,
  Heart,
  Store,
  ThumbsUp,
  ThumbsDown,
  Share2,
  Facebook,
  Twitter,
  Linkedin,
  X,
  DollarSign,
  Phone,
  MessageSquare,
} from 'lucide-react';
import Header from './Header';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { ConfirmationModal } from './ConfirmationModal';
import { AlertModal } from './AlertModal';
import { useAuth } from '../context/AuthContext';
import { toast } from '../utils/toast';
import {
  fetchCampaignById,
  fetchCampaigns,
  fetchCampaignVotes,
  voteCampaign,
  supportCampaign,
  inquiryCampaign,
  fetchCampaignSupporters,
  fetchCampaignInquiries,
  type CampaignListItem,
  type CampaignSupportItem,
  type CampaignInquiryItem,
} from '../services/campaignApi';

function formatDisplayDate(dateValue: string) {
  const parsedDate = new Date(dateValue);
  if (Number.isNaN(parsedDate.getTime())) return dateValue;
  return parsedDate.toLocaleDateString('en-GB');
}

export function CampaignDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [campaign, setCampaign] = useState<CampaignListItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Derived: true when the logged-in user owns this campaign
  const isOwner =
    campaign?.userId != null &&
    user?.id != null &&
    String(campaign.userId) === String(user.id);

  // Vote state
  const [upvotes, setUpvotes] = useState(0);
  const [downvotes, setDownvotes] = useState(0);
  const [userVote, setUserVote] = useState<'upvote' | 'downvote' | null>(null);
  const [isSubmittingVote, setIsSubmittingVote] = useState(false);
  const [showLoginVotePrompt, setShowLoginVotePrompt] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);

  // Support modal
  const [showSupportModal, setShowSupportModal] = useState(false);
  const [supportForm, setSupportForm] = useState({
    name: '',
    email: '',
    message: '',
    amount: '',
  });
  const [isSubmittingSupport, setIsSubmittingSupport] = useState(false);

  // Learn more modal
  const [showLearnMoreModal, setShowLearnMoreModal] = useState(false);
  const [learnMoreForm, setLearnMoreForm] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });
  const [isSubmittingInquiry, setIsSubmittingInquiry] = useState(false);

  // Alert
  const [alertMessage, setAlertMessage] = useState('');
  const [showAlert, setShowAlert] = useState(false);

  // Owner activity panel
  const [supporters, setSupporters] = useState<CampaignSupportItem[]>([]);
  const [inquiries, setInquiries] = useState<CampaignInquiryItem[]>([]);
  const [isLoadingOwnerData, setIsLoadingOwnerData] = useState(false);
  const [ownerDataError, setOwnerDataError] = useState('');

  // Load campaign
  useEffect(() => {
    if (!id) {
      navigate('/');
      return;
    }

    let isActive = true;

    async function loadCampaign() {
      setIsLoading(true);
      setError('');

      const singleResponse = await fetchCampaignById(id!);

      if (!isActive) return;

      if (singleResponse.success && singleResponse.data) {
        setCampaign(singleResponse.data);
        setUpvotes(singleResponse.data.upvotes || 0);
        setDownvotes(singleResponse.data.downvotes || 0);
        setIsLoading(false);
        return;
      }

      // Fallback: fetch all campaigns and find the one
      const allResponse = await fetchCampaigns();
      if (!isActive) return;

      if (allResponse.success) {
        const found = allResponse.data.find((c) => c.id === id);
        if (found) {
          setCampaign(found);
          setUpvotes(found.upvotes || 0);
          setDownvotes(found.downvotes || 0);
        } else {
          setError('Campaign not found.');
        }
      } else {
        setError(singleResponse.message || allResponse.message);
      }

      setIsLoading(false);
    }

    void loadCampaign();
    return () => {
      isActive = false;
    };
  }, [id, navigate]);

  // Load votes
  useEffect(() => {
    if (!id) return;
    let isActive = true;

    async function loadVotes() {
      const response = await fetchCampaignVotes(id!);
      if (!response.success || !response.data || !isActive) return;
      setUpvotes(response.data.upvotes);
      setDownvotes(response.data.downvotes);
      setUserVote(response.data.userVote);
    }

    void loadVotes();
    return () => {
      isActive = false;
    };
  }, [id]);

  // Load owner data when user is the campaign owner
  useEffect(() => {
    if (!id || !isAuthenticated || !campaign) return;
    if (!isOwner) return;
    let isActive = true;

    async function loadOwnerData() {
      setIsLoadingOwnerData(true);
      setOwnerDataError('');
      if (campaign!.type === 'cause') {
        // Individual campaigns only have supporters
        const supResponse = await fetchCampaignSupporters(id!);
        if (!isActive) return;
        setSupporters(supResponse.success ? supResponse.data : []);
        if (!supResponse.success)
          setOwnerDataError(
            supResponse.message || 'Could not load supporters.',
          );
      } else {
        // Business campaigns only have inquiries
        const inqResponse = await fetchCampaignInquiries(id!);
        if (!isActive) return;
        setInquiries(inqResponse.success ? inqResponse.data : []);
        if (!inqResponse.success)
          setOwnerDataError(inqResponse.message || 'Could not load inquiries.');
      }
      setIsLoadingOwnerData(false);
    }

    void loadOwnerData();
    return () => {
      isActive = false;
    };
  }, [id, isAuthenticated, campaign, user]);

  // Vote handlers
  const submitVote = async (voteType: 'upvote' | 'downvote') => {
    if (isSubmittingVote || !id) return;
    setIsSubmittingVote(true);
    const response = await voteCampaign(id, voteType);
    if (response.success && response.data) {
      setUpvotes(response.data.upvotes);
      setDownvotes(response.data.downvotes);
      setUserVote(response.data.userVote);
    }
    setIsSubmittingVote(false);
  };

  const handleUpvote = () => {
    if (!isAuthenticated) {
      setShowLoginVotePrompt(true);
      return;
    }
    void submitVote('upvote');
  };

  const handleDownvote = () => {
    if (!isAuthenticated) {
      setShowLoginVotePrompt(true);
      return;
    }
    void submitVote('downvote');
  };

  const handleShare = (platform: string) => {
    const url = window.location.href;
    const text = `Check out this campaign: ${campaign?.title ?? ''}`;
    switch (platform) {
      case 'facebook':
        window.open(
          `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
          '_blank',
        );
        break;
      case 'twitter':
        window.open(
          `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
          '_blank',
        );
        break;
      case 'linkedin':
        window.open(
          `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
          '_blank',
        );
        break;
    }
    setShowShareMenu(false);
  };

  // Support handlers
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
        /* ignore */
      }
    }
    setSupportForm((prev) => ({
      ...prev,
      name: storedName,
      email: storedEmail,
    }));
    setShowSupportModal(true);
  };

  const closeSupportModal = () => {
    setShowSupportModal(false);
    setSupportForm({ name: '', email: '', message: '', amount: '' });
  };

  const handleSupportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!campaign) return;
    setIsSubmittingSupport(true);
    const response = await supportCampaign(campaign.id, supportForm);
    setIsSubmittingSupport(false);
    if (!response.success) {
      setAlertMessage(response.message);
      setShowAlert(true);
      return;
    }
    toast.success(
      'Support Submitted',
      response.message || `Thank you for supporting ${campaign.title}!`,
    );
    closeSupportModal();
  };

  // Learn more handlers
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
        /* ignore */
      }
    }
    setLearnMoreForm((prev) => ({
      ...prev,
      name: storedName,
      email: storedEmail,
    }));
    setShowLearnMoreModal(true);
  };

  const closeLearnMoreModal = () => {
    setShowLearnMoreModal(false);
    setLearnMoreForm({ name: '', email: '', phone: '', message: '' });
  };

  const isValidAustralianPhone = (value: string) => {
    const normalizedPhone = value.replace(/[\s()-]/g, '');
    return /^(\+61|0)[2-478]\d{8}$/.test(normalizedPhone);
  };

  const handleLearnMoreSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!campaign) return;
    if (!isValidAustralianPhone(learnMoreForm.phone)) {
      setAlertMessage(
        'Please enter a valid Australian phone number (e.g. 0412345678 or +61412345678).',
      );
      setShowAlert(true);
      return;
    }
    setIsSubmittingInquiry(true);
    const response = await inquiryCampaign(campaign.id, learnMoreForm);
    setIsSubmittingInquiry(false);
    if (!response.success) {
      setAlertMessage(response.message);
      setShowAlert(true);
      return;
    }
    toast.success(
      'Inquiry Submitted',
      response.message || `Thank you for your interest in ${campaign.title}!`,
    );
    closeLearnMoreModal();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <Header
          back={{ position: 'left', to: '/', label: 'Back to Campaigns' }}
        />
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="animate-pulse space-y-4">
            <div className="h-64 bg-gray-200 rounded-xl" />
            <div className="h-8 bg-gray-200 rounded w-3/4" />
            <div className="h-4 bg-gray-200 rounded w-full" />
            <div className="h-4 bg-gray-200 rounded w-5/6" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !campaign) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <Header
          back={{ position: 'left', to: '/', label: 'Back to Campaigns' }}
        />
        <div className="max-w-4xl mx-auto px-4 py-12 text-center">
          <p className="text-red-600 text-lg mb-4">
            {error || 'Campaign not found.'}
          </p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Campaigns
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Header
        back={{ position: 'left', to: '/', label: 'Back to Campaigns' }}
      />

      {/* Mobile + tablet bottom action bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 flex items-center justify-around z-50 shadow-lg">
        <button
          onClick={handleUpvote}
          disabled={isSubmittingVote}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
            userVote === 'upvote'
              ? 'bg-green-500 text-white'
              : 'bg-gray-100 text-gray-700'
          }`}
        >
          <ThumbsUp className="size-4" />
          <span className="text-sm font-semibold">{upvotes}</span>
        </button>
        <button
          onClick={handleDownvote}
          disabled={isSubmittingVote}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
            userVote === 'downvote'
              ? 'bg-red-500 text-white'
              : 'bg-gray-100 text-gray-700'
          }`}
        >
          <ThumbsDown className="size-4" />
          <span className="text-sm font-semibold">{downvotes}</span>
        </button>
        <div className="relative">
          <button
            onClick={() => setShowShareMenu(!showShareMenu)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 text-gray-700 transition-colors"
          >
            <Share2 className="size-4" />
            <span className="text-sm font-semibold">Share</span>
          </button>
          {showShareMenu && (
            <div className="absolute bottom-full mb-2 right-0 bg-white rounded-lg shadow-xl border border-gray-200 p-2 min-w-[130px]">
              <button
                onClick={() => handleShare('facebook')}
                className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-blue-50 rounded-lg"
              >
                <Facebook className="size-4 text-blue-600" /> Facebook
              </button>
              <button
                onClick={() => handleShare('twitter')}
                className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-blue-50 rounded-lg"
              >
                <Twitter className="size-4 text-blue-400" /> Twitter
              </button>
              <button
                onClick={() => handleShare('linkedin')}
                className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-blue-50 rounded-lg"
              >
                <Linkedin className="size-4 text-blue-700" /> LinkedIn
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Desktop floating vote/share sidebar — only on large screens */}
      <div className="hidden lg:flex fixed right-8 top-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-xl p-3 flex-col gap-3 border border-gray-200 z-40">
        <button
          onClick={handleUpvote}
          disabled={isSubmittingVote}
          className={`flex flex-col items-center gap-1 px-4 py-3 rounded-lg transition-colors ${
            userVote === 'upvote'
              ? 'bg-green-500 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-green-100'
          }`}
        >
          <ThumbsUp className="size-5" />
          <span className="text-xs font-semibold">{upvotes}</span>
        </button>
        <button
          onClick={handleDownvote}
          disabled={isSubmittingVote}
          className={`flex flex-col items-center gap-1 px-4 py-3 rounded-lg transition-colors ${
            userVote === 'downvote'
              ? 'bg-red-500 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-red-100'
          }`}
        >
          <ThumbsDown className="size-5" />
          <span className="text-xs font-semibold">{downvotes}</span>
        </button>
        <div className="relative">
          <button
            onClick={() => setShowShareMenu(!showShareMenu)}
            className="flex flex-col items-center gap-1 px-4 py-3 rounded-lg bg-gray-100 text-gray-700 hover:bg-blue-100 transition-colors"
          >
            <Share2 className="size-5" />
            <span className="text-xs font-semibold">Share</span>
          </button>
          {showShareMenu && (
            <div className="absolute right-full mr-2 top-0 bg-white rounded-lg shadow-xl border border-gray-200 p-2 min-w-[120px]">
              <button
                onClick={() => handleShare('facebook')}
                className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-blue-50 rounded-lg"
              >
                <Facebook className="size-4 text-blue-600" /> Facebook
              </button>
              <button
                onClick={() => handleShare('twitter')}
                className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-blue-50 rounded-lg"
              >
                <Twitter className="size-4 text-blue-400" /> Twitter
              </button>
              <button
                onClick={() => handleShare('linkedin')}
                className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-blue-50 rounded-lg"
              >
                <Linkedin className="size-4 text-blue-700" /> LinkedIn
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-6 pb-24 lg:pb-10">
        {/* Image / Video */}
        <div className="mb-6">
          {campaign.videoUrl ? (
            <div className="relative h-48 sm:h-96 rounded-xl overflow-hidden bg-black">
              <iframe
                src={campaign.videoUrl}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title={campaign.title}
              />
            </div>
          ) : (
            <div className="relative h-48 sm:h-96 rounded-xl overflow-hidden">
              <ImageWithFallback
                src={campaign.image}
                alt={campaign.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-3 right-3">
                <span
                  className={`px-3 py-1 rounded-full text-sm font-semibold ${campaign.type === 'cause' ? 'bg-blue-500 text-white' : 'bg-purple-500 text-white'}`}
                >
                  {campaign.type === 'cause'
                    ? 'Social Cause'
                    : 'Small Business'}
                </span>
              </div>
              <div className="absolute top-3 left-3">
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/90 text-gray-800">
                  {campaign.category}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Title */}
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
          {campaign.title}
        </h1>

        <div className="space-y-6">
          {/* About */}
          <div>
            <h2 className="text-lg sm:text-2xl font-bold text-gray-900 mb-2 sm:mb-3">
              About This Campaign
            </h2>
            <p className="text-sm sm:text-lg text-gray-700 leading-relaxed">
              {campaign.fullDescription}
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4 p-3 sm:p-6 bg-gray-50 rounded-xl">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="bg-blue-100 p-2 sm:p-3 rounded-lg shrink-0">
                <Users className="size-4 sm:size-6 text-blue-600" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-gray-500">Supporters</p>
                <p className="text-base sm:text-xl font-bold text-gray-900 truncate">
                  {campaign.supporters}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="bg-green-100 p-2 sm:p-3 rounded-lg shrink-0">
                <Calendar className="size-4 sm:size-6 text-green-600" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-gray-500">Start Date</p>
                <p className="text-base sm:text-xl font-bold text-gray-900 truncate">
                  {formatDisplayDate(campaign.startDate)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="bg-purple-100 p-2 sm:p-3 rounded-lg shrink-0">
                <MapPin className="size-4 sm:size-6 text-purple-600" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-gray-500">Location</p>
                <p className="text-base sm:text-xl font-bold text-gray-900 truncate">
                  {campaign.location}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="bg-orange-100 p-2 sm:p-3 rounded-lg shrink-0">
                <Mail className="size-4 sm:size-6 text-orange-600" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-gray-500">Contact</p>
                <p className="text-sm sm:text-base font-bold text-gray-900 truncate">
                  {campaign.contact}
                </p>
              </div>
            </div>
          </div>

          {/* Goals */}
          <div>
            <h2 className="text-base sm:text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
              <Target className="size-5 text-blue-600" />
              Campaign Goals
            </h2>
            <ul className="space-y-3">
              {campaign.goals.map((goal, index) => (
                <li
                  key={index}
                  className="flex items-start gap-3 p-3 bg-green-50 rounded-lg"
                >
                  <div className="bg-green-500 rounded-full p-1 mt-0.5 shrink-0">
                    <div className="size-2 bg-white rounded-full" />
                  </div>
                  <span className="text-sm sm:text-base text-gray-700 font-medium">
                    {goal}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* CTA — hidden for the campaign owner */}
          {!isOwner && (
            <button
              onClick={
                campaign.type === 'cause' ? handleSupportCause : handleLearnMore
              }
              className="w-full flex items-center justify-center gap-2 px-4 sm:px-6 py-3 sm:py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold text-base sm:text-lg"
            >
              {campaign.type === 'cause' ? (
                <>
                  <Heart className="size-5" /> Support This Cause
                </>
              ) : (
                <>
                  <Store className="size-5" /> Learn More
                </>
              )}
            </button>
          )}
        </div>

        {/* ── Owner Activity Panel ────────────────────────────── */}
        {isOwner && (
          <div className="mt-8 bg-white rounded-2xl shadow-md overflow-hidden">
            <div className="px-4 sm:px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center gap-2">
                <Users className="size-5 text-blue-600" />
                {campaign.type === 'cause' ? 'Supporters' : 'Inquiries'}
                <span className="text-xs font-medium bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                  Owner View
                </span>
              </h2>
              <p className="text-sm text-gray-500 mt-0.5">
                Only you can see this section
              </p>
            </div>

            {/* Single panel — no tabs */}
            <div className="p-4 sm:p-6">
              {isLoadingOwnerData ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="h-16 bg-gray-100 rounded-xl animate-pulse"
                    />
                  ))}
                </div>
              ) : ownerDataError ? (
                <div className="text-center py-8 text-gray-400">
                  <MessageSquare className="size-10 mx-auto mb-2 opacity-40" />
                  <p className="text-sm">{ownerDataError}</p>
                </div>
              ) : campaign.type === 'cause' ? (
                // CAUSE — show supporters
                <>
                  {supporters.length === 0 ? (
                    <div className="text-center py-8 text-gray-400">
                      <DollarSign className="size-10 mx-auto mb-2 opacity-40" />
                      <p className="text-sm">No supporters yet.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {supporters.map((s) => (
                        <div
                          key={s.id}
                          className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 p-3 sm:p-4 bg-green-50 rounded-xl border border-green-100"
                        >
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            <div className="size-9 rounded-full bg-green-200 flex items-center justify-center shrink-0 font-bold text-green-700 text-sm">
                              {s.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <p className="font-semibold text-gray-900 text-sm truncate">
                                {s.name}
                              </p>
                              <p className="text-xs text-gray-500 truncate">
                                {s.email}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4 shrink-0">
                            <span className="text-green-700 font-bold text-sm">
                              ${s.amount}
                            </span>
                            <span className="text-xs text-gray-400">
                              {s.created_at
                                ? new Date(s.created_at).toLocaleDateString(
                                    'en-GB',
                                  )
                                : '—'}
                            </span>
                          </div>
                          {s.message && (
                            <p className="text-xs text-gray-600 italic sm:w-full border-t sm:border-t-0 sm:border-l border-green-200 sm:pl-4 pt-2 sm:pt-0">
                              "{s.message}"
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                // BUSINESS — show inquiries
                <>
                  {inquiries.length === 0 ? (
                    <div className="text-center py-8 text-gray-400">
                      <MessageSquare className="size-10 mx-auto mb-2 opacity-40" />
                      <p className="text-sm">No inquiries yet.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {inquiries.map((inq) => (
                        <div
                          key={inq.id}
                          className="p-3 sm:p-4 bg-purple-50 rounded-xl border border-purple-100"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-4">
                            <div className="flex items-center gap-3 min-w-0 flex-1">
                              <div className="size-9 rounded-full bg-purple-200 flex items-center justify-center shrink-0 font-bold text-purple-700 text-sm">
                                {inq.name.charAt(0).toUpperCase()}
                              </div>
                              <div className="min-w-0">
                                <p className="font-semibold text-gray-900 text-sm truncate">
                                  {inq.name}
                                </p>
                                <p className="text-xs text-gray-500 truncate">
                                  {inq.email}
                                </p>
                                {inq.phone && (
                                  <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                                    <Phone className="size-3" /> {inq.phone}
                                  </p>
                                )}
                              </div>
                            </div>
                            <span className="text-xs text-gray-400 shrink-0">
                              {inq.created_at
                                ? new Date(inq.created_at).toLocaleDateString(
                                    'en-GB',
                                  )
                                : '—'}
                            </span>
                          </div>
                          {inq.message && (
                            <p className="mt-2 text-sm text-gray-700 italic border-t border-purple-200 pt-2">
                              "{inq.message}"
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Login prompt for voting */}
      <ConfirmationModal
        isOpen={showLoginVotePrompt}
        onClose={() => setShowLoginVotePrompt(false)}
        title="Login Required"
        message="You need to login to vote. Would you like to login now?"
        confirmText="Login"
        onConfirm={() => navigate('/login')}
      />

      {/* Support Modal */}
      {showSupportModal && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={closeSupportModal}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white border-b border-gray-200 px-4 sm:px-6 py-4 flex justify-between items-center rounded-t-2xl">
              <h2 className="text-lg sm:text-2xl font-bold text-gray-900">
                Support {campaign.title}
              </h2>
              <button
                onClick={closeSupportModal}
                className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full p-2 transition-colors"
              >
                <X className="size-5" />
              </button>
            </div>
            <div className="p-4 sm:p-6">
              <form onSubmit={handleSupportSubmit}>
                <div className="mb-4">
                  <label
                    htmlFor="support-name"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Name
                  </label>
                  <input
                    type="text"
                    id="support-name"
                    value={supportForm.name}
                    disabled
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-gray-50"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label
                    htmlFor="support-email"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Email
                  </label>
                  <input
                    type="email"
                    id="support-email"
                    value={supportForm.email}
                    disabled
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-gray-50"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label
                    htmlFor="support-message"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Message
                  </label>
                  <textarea
                    id="support-message"
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
                    htmlFor="support-amount"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Amount
                  </label>
                  <input
                    type="number"
                    id="support-amount"
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
                  className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold disabled:opacity-60"
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
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={closeLearnMoreModal}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white border-b border-gray-200 px-4 sm:px-6 py-4 flex justify-between items-center rounded-t-2xl">
              <h2 className="text-lg sm:text-2xl font-bold text-gray-900">
                Learn More About {campaign.title}
              </h2>
              <button
                onClick={closeLearnMoreModal}
                className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full p-2 transition-colors"
              >
                <X className="size-5" />
              </button>
            </div>
            <div className="p-4 sm:p-6">
              <form onSubmit={handleLearnMoreSubmit}>
                <div className="mb-4">
                  <label
                    htmlFor="learn-name"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Name
                  </label>
                  <input
                    type="text"
                    id="learn-name"
                    value={learnMoreForm.name}
                    disabled
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm sm:text-sm bg-gray-50"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label
                    htmlFor="learn-email"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Email
                  </label>
                  <input
                    type="email"
                    id="learn-email"
                    value={learnMoreForm.email}
                    disabled
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm sm:text-sm bg-gray-50"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label
                    htmlFor="learn-phone"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Phone
                  </label>
                  <input
                    type="tel"
                    id="learn-phone"
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
                    htmlFor="learn-message"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Message
                  </label>
                  <textarea
                    id="learn-message"
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
                  className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold disabled:opacity-60"
                >
                  {isSubmittingInquiry ? 'Submitting...' : 'Submit Inquiry'}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Alert */}
      {showAlert && (
        <AlertModal
          message={alertMessage}
          onClose={() => setShowAlert(false)}
        />
      )}
    </div>
  );
}
