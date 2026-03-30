import {
  X,
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
} from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { ConfirmationModal } from './ConfirmationModal';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { fetchCampaignVotes, voteCampaign } from '../services/campaignApi';

interface Campaign {
  id: string;
  title: string;
  description: string;
  fullDescription: string;
  image: string;
  type: 'cause' | 'business';
  category: string;
  startDate: string;
  supporters: string;
  location: string;
  contact: string;
  goals: string[];
  upvotes?: number;
  downvotes?: number;
  videoUrl?: string;
}

interface CampaignDetailModalProps {
  campaign: Campaign;
  onClose: () => void;
  onSupportCause: () => void;
  onLearnMore: () => void;
  onVoteUpdate?: (
    campaignId: string,
    upvotes: number,
    downvotes: number,
  ) => void;
}

function formatDisplayDate(dateValue: string) {
  const parsedDate = new Date(dateValue);

  if (Number.isNaN(parsedDate.getTime())) {
    return dateValue;
  }

  return parsedDate.toLocaleDateString('en-GB');
}

export function CampaignDetailModal({
  campaign,
  onClose,
  onSupportCause,
  onLearnMore,
  onVoteUpdate,
}: CampaignDetailModalProps) {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [upvotes, setUpvotes] = useState(campaign.upvotes || 0);
  const [downvotes, setDownvotes] = useState(campaign.downvotes || 0);
  const [userVote, setUserVote] = useState<'upvote' | 'downvote' | null>(null);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [isSubmittingVote, setIsSubmittingVote] = useState(false);
  const [showLoginVotePrompt, setShowLoginVotePrompt] = useState(false);

  useEffect(() => {
    setUpvotes(campaign.upvotes || 0);
    setDownvotes(campaign.downvotes || 0);
    setUserVote(null);
  }, [campaign.id, campaign.upvotes, campaign.downvotes]);

  useEffect(() => {
    let isActive = true;

    const loadVotes = async () => {
      const response = await fetchCampaignVotes(campaign.id);

      if (!response.success || !response.data || !isActive) {
        return;
      }

      setUpvotes(response.data.upvotes);
      setDownvotes(response.data.downvotes);
      setUserVote(response.data.userVote);
    };

    void loadVotes();

    return () => {
      isActive = false;
    };
  }, [campaign.id]);

  const submitVote = async (voteType: 'upvote' | 'downvote') => {
    if (isSubmittingVote) {
      return;
    }

    setIsSubmittingVote(true);
    const response = await voteCampaign(campaign.id, voteType);

    if (response.success && response.data) {
      setUpvotes(response.data.upvotes);
      setDownvotes(response.data.downvotes);
      setUserVote(response.data.userVote);
      onVoteUpdate?.(
        campaign.id,
        response.data.upvotes,
        response.data.downvotes,
      );
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
    const text = `Check out this campaign: ${campaign.title}`;

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

  return (
    <div
      className="fixed inset-0 bg-white flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Interaction Bar - Floating Sidebar */}
        <div className="fixed right-8 top-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-xl p-3 flex flex-col gap-3 border border-gray-200 z-50">
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
                  <Facebook className="size-4 text-blue-600" />
                  Facebook
                </button>
                <button
                  onClick={() => handleShare('twitter')}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-blue-50 rounded-lg"
                >
                  <Twitter className="size-4 text-blue-400" />
                  Twitter
                </button>
                <button
                  onClick={() => handleShare('linkedin')}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-blue-50 rounded-lg"
                >
                  <Linkedin className="size-4 text-blue-700" />
                  LinkedIn
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center rounded-t-2xl z-10">
          <h2 className="text-2xl font-bold text-gray-900">{campaign.title}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full p-2 transition-colors"
          >
            <X className="size-6" />
          </button>
        </div>

        <div className="p-6">
          {/* Multimedia Area */}
          <div className="mb-6">
            {campaign.videoUrl ? (
              <div className="relative h-96 rounded-xl overflow-hidden bg-black">
                <iframe
                  src={campaign.videoUrl}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  title={campaign.title}
                />
              </div>
            ) : (
              <div className="relative h-96 rounded-xl overflow-hidden">
                <ImageWithFallback
                  src={campaign.image}
                  alt={campaign.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 right-4">
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
                <div className="absolute top-4 left-4">
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/90 text-gray-800">
                    {campaign.category}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Content Area with Hierarchy */}
          <div className="space-y-6">
            {/* Primary Content */}
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                About This Campaign
              </h3>
              <p className="text-lg text-gray-700 leading-relaxed">
                {campaign.fullDescription}
              </p>
            </div>

            {/* Secondary Content - Campaign Stats */}
            <div className="grid grid-cols-2 gap-4 p-6 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 p-3 rounded-lg">
                  <Users className="size-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Supporters</p>
                  <p className="text-xl font-bold text-gray-900">
                    {campaign.supporters}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-green-100 p-3 rounded-lg">
                  <Calendar className="size-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Start Date</p>
                  <p className="text-xl font-bold text-gray-900">
                    {formatDisplayDate(campaign.startDate)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-purple-100 p-3 rounded-lg">
                  <MapPin className="size-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Location</p>
                  <p className="text-xl font-bold text-gray-900">
                    {campaign.location}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-orange-100 p-3 rounded-lg">
                  <Mail className="size-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Contact</p>
                  <p className="text-base font-bold text-gray-900">
                    {campaign.contact}
                  </p>
                </div>
              </div>
            </div>

            {/* Tertiary Content - Goals */}
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Target className="size-6 text-blue-600" />
                Campaign Goals
              </h3>
              <ul className="space-y-3">
                {campaign.goals.map((goal, index) => (
                  <li
                    key={index}
                    className="flex items-start gap-3 p-3 bg-green-50 rounded-lg"
                  >
                    <div className="bg-green-500 rounded-full p-1 mt-1">
                      <div className="size-2 bg-white rounded-full"></div>
                    </div>
                    <span className="text-gray-700 font-medium">{goal}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* CTA Button */}
            <button
              onClick={campaign.type === 'cause' ? onSupportCause : onLearnMore}
              className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold text-lg"
            >
              {campaign.type === 'cause' ? (
                <>
                  <Heart className="size-6" />
                  Support This Cause
                </>
              ) : (
                <>
                  <Store className="size-6" />
                  Learn More
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <ConfirmationModal
        isOpen={showLoginVotePrompt}
        onClose={() => setShowLoginVotePrompt(false)}
        title="Login Required"
        message="You need to login to vote. Would you like to login now?"
        confirmText="Login"
        onConfirm={() => navigate('/login')}
      />
    </div>
  );
}
