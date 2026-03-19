import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router';
import { Mail, Lock, User, UserPlus, Check, X } from 'lucide-react';
import { toast } from '../utils/toast';
import Header from './Header';

export function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [passwordFocused, setPasswordFocused] = useState(false);

  // Redirect to home if already authenticated
  if (isAuthenticated) {
    navigate('/', { replace: true });
    return null;
  }

  // Live password rule checks
  const hasLength = password.length >= 6;
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecial = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>\/?]/.test(password);
  const passwordValid = hasLength && hasUppercase && hasNumber && hasSpecial;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setNameError('');
    setEmailError('');
    setPasswordError('');
    setConfirmPasswordError('');

    let hasFieldError = false;
    if (!name || !name.trim()) {
      setNameError('Please enter your full name');
      hasFieldError = true;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      setEmailError('Please enter a valid email address');
      hasFieldError = true;
    }

    const pwdRule =
      /(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>\/?]).+/;
    if (!password || password.length < 6) {
      setPasswordError('Password must be at least 6 characters long');
      hasFieldError = true;
    } else if (!pwdRule.test(password)) {
      setPasswordError(
        'Password must include an uppercase letter, a number and a special character',
      );
      hasFieldError = true;
    }

    if (password !== confirmPassword) {
      setConfirmPasswordError('Passwords do not match');
      hasFieldError = true;
    }

    if (hasFieldError) return;

    setLoading(true);

    try {
      const result = await register(email, password, name);
      if (result.success) {
        toast.success(
          'Registration Successful!',
          'Your account has been created. Please log in to continue.',
        );
        setTimeout(() => {
          navigate('/login');
        }, 1500);
      } else {
        toast.error(
          'Registration Failed',
          result.message || 'Please try again.',
        );
      }
    } catch (err) {
      toast.error('Error', 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Header back={{ position: 'right', to: '/', label: 'Back to Home' }} />

      {/* Main Content */}
      <div className="flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
                <UserPlus className="size-8 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900">
                Join Our Community
              </h2>
              <p className="text-gray-600 mt-2">
                Start creating campaigns and making an impact
              </p>
            </div>

            <form onSubmit={handleSubmit} noValidate className="space-y-6">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="size-5 text-gray-400" />
                  </div>
                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      setNameError('');
                    }}
                    className={`block w-full pl-10 pr-3 py-3 border rounded-lg focus:ring-2 focus:border-transparent ${
                      nameError
                        ? 'border-red-600 focus:ring-red-500'
                        : 'border-gray-300 focus:ring-purple-500'
                    }`}
                    placeholder="John Doe"
                    required
                  />
                </div>
                {nameError && (
                  <p className="mt-2 text-sm text-red-600">{nameError}</p>
                )}
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="size-5 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setEmailError('');
                    }}
                    className={`block w-full pl-10 pr-3 py-3 border rounded-lg focus:ring-2 focus:border-transparent ${
                      emailError
                        ? 'border-red-600 focus:ring-red-500'
                        : 'border-gray-300 focus:ring-purple-500'
                    }`}
                    placeholder="you@example.com"
                    required
                  />
                </div>
                {emailError && (
                  <p className="mt-2 text-sm text-red-600">{emailError}</p>
                )}
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="size-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setPasswordError('');
                    }}
                    onFocus={() => setPasswordFocused(true)}
                    onBlur={() => setPasswordFocused(false)}
                    className={`block w-full pl-10 pr-3 py-3 border rounded-lg focus:ring-2 focus:border-transparent ${
                      passwordError
                        ? 'border-red-600 focus:ring-red-500'
                        : 'border-gray-300 focus:ring-purple-500'
                    }`}
                    placeholder="••••••••"
                    required
                  />
                </div>
                <p className="mt-2 text-xs text-gray-500">
                  Password must include at least one uppercase letter, one
                  number and one special character. Minimum 6 characters.
                </p>

                {passwordFocused && (
                  <ul className="mt-3 text-sm pl-0">
                    <li
                      className={`flex items-center gap-2 pl-0 ${
                        hasLength ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      {hasLength ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <X className="w-4 h-4" />
                      )}
                      <span className="text-sm">At least 6 characters</span>
                    </li>
                    <li
                      className={`flex items-center gap-2 ${
                        hasUppercase ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      {hasUppercase ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <X className="w-4 h-4" />
                      )}
                      <span className="text-sm">
                        One uppercase letter (A-Z)
                      </span>
                    </li>
                    <li
                      className={`flex items-center gap-2 ${
                        hasNumber ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      {hasNumber ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <X className="w-4 h-4" />
                      )}
                      <span className="text-sm">One number (0-9)</span>
                    </li>
                    <li
                      className={`flex items-center gap-2 ${
                        hasSpecial ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      {hasSpecial ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <X className="w-4 h-4" />
                      )}
                      <span className="text-sm">
                        One special character (e.g. !@#$%)
                      </span>
                    </li>
                  </ul>
                )}
                {passwordError && (
                  <p className="mt-2 text-sm text-red-600">{passwordError}</p>
                )}
              </div>

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="size-5 text-gray-400" />
                  </div>
                  <input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      setConfirmPasswordError('');
                    }}
                    className={`block w-full pl-10 pr-3 py-3 border rounded-lg focus:ring-2 focus:border-transparent ${
                      confirmPasswordError
                        ? 'border-red-600 focus:ring-red-500'
                        : 'border-gray-300 focus:ring-purple-500'
                    }`}
                    placeholder="••••••••"
                    required
                  />
                </div>
                {confirmPasswordError && (
                  <p className="mt-2 text-sm text-red-600">
                    {confirmPasswordError}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-gray-600">
                Already have an account?{' '}
                <Link
                  to="/login"
                  className="text-blue-600 font-semibold hover:text-blue-700"
                >
                  Sign In
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>

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
