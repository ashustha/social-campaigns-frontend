import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import {
  Home,
  User,
  LogIn,
  LogOut,
  ChevronDown,
  ArrowLeft,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { toast } from '../utils/toast';

type BackConfig = {
  position?: 'left' | 'right';
  to?: string;
  label?: string;
};

interface HeaderProps {
  title?: string;
  subtitle?: string;
  back?: BackConfig;
}

export default function Header({ title, subtitle, back }: HeaderProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setIsDropdownOpen(false);
    toast.success('Logged Out', 'You have been successfully logged out.');
    navigate('/login');
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            {back?.position === 'left' && (
              <button
                onClick={() => navigate(back.to || '/')}
                className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="size-5" />
                <span className="text-sm">{back.label || 'Back'}</span>
              </button>
            )}

            <div
              className={
                back?.position === 'left' ? 'border-l border-gray-300 pl-4' : ''
              }
            >
              {title ? (
                <>
                  <h1 className="text-2xl font-bold text-blue-900">{title}</h1>
                  {subtitle && (
                    <p className="text-sm text-gray-600">{subtitle}</p>
                  )}
                </>
              ) : (
                <>
                  <h1 className="text-2xl font-bold text-blue-900">
                    Advanced Consulting Services
                  </h1>
                  <p className="text-sm text-gray-600">
                    Social Awareness & Business Promotion Platform
                  </p>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4">
            {back?.position === 'right' && (
              <Link
                to={back.to || '/'}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <Home className="size-4" />
                {back.label || 'Back to Home'}
              </Link>
            )}

            {back?.position !== 'right' &&
              // default behaviour: show user controls or login button (unless a right-position back link is used)
              (user ? (
                <>
                  <button
                    onClick={() => navigate('/dashboard')}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <User className="size-4" />
                    My Dashboard
                  </button>

                  <div className="relative">
                    <button
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                      <User className="size-5 text-gray-700" />
                      <span className="text-gray-700">{user.name}</span>
                      <ChevronDown
                        className={`size-4 text-gray-700 transition-transform ${
                          isDropdownOpen ? 'rotate-180' : ''
                        }`}
                      />
                    </button>

                    {isDropdownOpen && (
                      <>
                        <div
                          className="fixed inset-0 z-10"
                          onClick={() => setIsDropdownOpen(false)}
                        />
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
                          <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-2 px-4 py-2 text-left text-red-600 hover:bg-red-50 transition-colors"
                          >
                            <LogOut className="size-4" />
                            Logout
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </>
              ) : (
                <button
                  onClick={() => navigate('/login')}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <LogIn className="size-4" />
                  Login
                </button>
              ))}
          </div>
        </div>
      </div>
    </header>
  );
}
