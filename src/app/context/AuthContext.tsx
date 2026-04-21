import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from 'react';

const API_BASE_URL =
  (import.meta as any).env?.VITE_API_BASE_URL ?? 'http://localhost:3000/api';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (
    email: string,
    password: string,
  ) => Promise<{ success: boolean; message?: string }>;
  register: (
    email: string,
    password: string,
    name: string,
    role: string,
    businessDetails?: { abn: string; phone: string; address: string },
  ) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  // Initialize user from localStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('authToken');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Error restoring session:', error);
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
      }
    }

    const handleAuthLogout = () => {
      setUser(null);
      setToken(null);
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
    };

    const handleTokenUpdated = (event: Event) => {
      const customEvent = event as CustomEvent<{ token?: string }>;
      const nextToken =
        customEvent.detail?.token ?? localStorage.getItem('authToken') ?? null;
      setToken(nextToken);
    };

    window.addEventListener('auth:logout', handleAuthLogout);
    window.addEventListener('auth:token-updated', handleTokenUpdated);

    return () => {
      window.removeEventListener('auth:logout', handleAuthLogout);
      window.removeEventListener('auth:token-updated', handleTokenUpdated);
    };
  }, []);

  const login = async (
    email: string,
    password: string,
  ): Promise<{ success: boolean; message?: string }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      let data: any;
      const contentType = response.headers.get('content-type');

      if (contentType?.includes('application/json')) {
        data = await response.json();
      } else {
        const text = await response.text();
        console.error('Unexpected response format:', text.substring(0, 200));
        return {
          success: false,
          message: `Server error: Invalid response format. Is the backend API running at ${API_BASE_URL}?`,
        };
      }

      if (!response.ok) {
        const errorMessage = data.message || data.error || 'Login failed';
        console.error('Login error:', errorMessage);
        return { success: false, message: errorMessage };
      }

      // Extract token from response (adjust based on your API response format)
      const authToken = data.token || data.accessToken || '';

      // Set user with the response data
      const userData: User = {
        id: data.id || '1',
        email: data.email || email,
        name: data.name || email.split('@')[0],
        role: data.role || 'user',
      };

      // Strictly deny admin accounts from the client portal
      if (userData.role === 'admin') {
        return {
          success: false,
          message: 'Admin accounts must use the admin portal.',
        };
      }

      // Only allow user and business roles on the client side
      if (!['user', 'business'].includes(userData.role)) {
        return {
          success: false,
          message: 'Access denied. Invalid account type.',
        };
      }

      // Store token and user data in localStorage
      if (authToken) {
        localStorage.setItem('authToken', authToken);
      }
      localStorage.setItem('user', JSON.stringify(userData));

      setToken(authToken);
      setUser(userData);

      return { success: true };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'An unexpected error occurred';
      console.error('Login error:', errorMessage);
      return {
        success: false,
        message: `Connection error: ${errorMessage}. Make sure the backend API is running at ${API_BASE_URL}`,
      };
    }
  };

  const register = async (
    email: string,
    password: string,
    name: string,
    role: string,
    businessDetails?: { abn: string; phone: string; address: string },
  ): Promise<{ success: boolean; message?: string }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          email,
          password,
          role,
          ...(businessDetails && {
            abn: businessDetails.abn,
            phone: businessDetails.phone,
            address: businessDetails.address,
          }),
        }),
      });

      let data: any;
      const contentType = response.headers.get('content-type');

      if (contentType?.includes('application/json')) {
        data = await response.json();
      } else {
        const text = await response.text();
        console.error('Unexpected response format:', text.substring(0, 200));
        return {
          success: false,
          message: `Server error: Invalid response format. Is the backend API running at ${API_BASE_URL}?`,
        };
      }

      if (!response.ok) {
        const errorMessage =
          data.message || data.error || 'Registration failed';
        console.error('Registration error:', errorMessage);
        return { success: false, message: errorMessage };
      }

      // Registration successful - don't log user in, let them go to login page
      return { success: true };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'An unexpected error occurred';
      console.error('Registration error:', errorMessage);
      return {
        success: false,
        message: `Connection error: ${errorMessage}. Make sure the backend API is running at ${API_BASE_URL}`,
      };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        register,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
