import { Heart, Users, Calendar, TrendingUp, Store, ThumbsUp, ThumbsDown } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { ConfirmationModal } from './ConfirmationModal';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router';

interface Campaign {
  id: string;
  title: string;
  description: string;
  image: string;
  type: 'cause' | 'business';
  category: string;
  startDate: string;
  supporters: string;
  upvotes?: number;
  downvotes?: number;
}

interface CampaignCardProps {
  campaign: Campaign;
  onReadMore: (campaign: Campaign) => void;
}

export function CampaignCard({ campaign, onReadMore }: CampaignCardProps) {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [upvotes, setUpvotes] = useState(campaign.upvotes || 0);
  const [downvotes, setDownvotes] = useState(campaign.downvotes || 0);
  const [userVote, setUserVote] = useState<'up' | 'down' | null>(null);
  const [showLoginVotePrompt, setShowLoginVotePrompt] = useState(false);
  const [showLoginReadPrompt, setShowLoginReadPrompt] = useState(false);

  const handleUpvote = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!isAuthenticated) {
      setShowLoginVotePrompt(true);
      return;
    }
    
    if (userVote === 'up') {
      setUpvotes(upvotes - 1);
      setUserVote(null);
    } else {
      if (userVote === 'down') {
        setDownvotes(downvotes - 1);
      }
      setUpvotes(upvotes + 1);
      setUserVote('up');
    }
  };

  const handleDownvote = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!isAuthenticated) {
      setShowLoginVotePrompt(true);
      return;
    }
    
    if (userVote === 'down') {
      setDownvotes(downvotes - 1);
      setUserVote(null);
    } else {
      if (userVote === 'up') {
        setUpvotes(upvotes - 1);
      }
      setDownvotes(downvotes + 1);
      setUserVote('down');
    }
  };

  const handleReadMore = () => {
    if (!isAuthenticated) {
      setShowLoginReadPrompt(true);
      return;
    }
    onReadMore(campaign);
  };

  return (
    <>
      <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all hover:-translate-y-1">
        <div className="relative h-48">
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
              {campaign.type === 'cause' ? 'Social Cause' : 'Small Business'}
            </span>
          </div>
          <div className="absolute top-4 left-4">
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/90 text-gray-800">
              {campaign.category}
            </span>
          </div>
        </div>
        <div className="p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-2">{campaign.title}</h3>
          <p className="text-gray-600 mb-4 text-sm line-clamp-3">{campaign.description}</p>
          <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
            <div className="flex items-center gap-1">
              <Users className="size-4" />
              <span>{campaign.supporters}</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="size-4" />
              <span>{campaign.startDate}</span>
            </div>
            <div className="flex items-center gap-1">
              <TrendingUp className="size-4 text-green-600" />
            </div>
          </div>
          
          {/* Upvote/Downvote Section */}
          <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <button
                onClick={handleUpvote}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg transition-colors ${
                  userVote === 'up'
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-green-100'
                }`}
              >
                <ThumbsUp className="size-4" />
                <span className="font-semibold">{upvotes}</span>
              </button>
              <button
                onClick={handleDownvote}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg transition-colors ${
                  userVote === 'down'
                    ? 'bg-red-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-red-100'
                }`}
              >
                <ThumbsDown className="size-4" />
                <span className="font-semibold">{downvotes}</span>
              </button>
            </div>
          </div>

          <button 
            onClick={handleReadMore}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            {campaign.type === 'cause' ? (
              <>
                <Heart className="size-4" />
                Read More
              </>
            ) : (
              <>
                <Store className="size-4" />
                Read More
              </>
            )}
          </button>
        </div>
      </div>

      {/* Login Prompt for Voting */}
      <ConfirmationModal
        isOpen={showLoginVotePrompt}
        onClose={() => setShowLoginVotePrompt(false)}
        title="Login Required"
        message="You need to login to vote. Would you like to login now?"
        confirmText="Login"
        onConfirm={() => navigate('/login')}
      />

      {/* Login Prompt for Reading More */}
      <ConfirmationModal
        isOpen={showLoginReadPrompt}
        onClose={() => setShowLoginReadPrompt(false)}
        title="Login Required"
        message="You need to login to view campaign details. Would you like to login now?"
        confirmText="Login"
        onConfirm={() => navigate('/login')}
      />
    </>
  );
}