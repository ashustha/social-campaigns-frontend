import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from 'react';

interface User {
  id: string;
  email: string;
  name: string;
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
  }, []);

  const login = async (
    email: string,
    password: string,
  ): Promise<{ success: boolean; message?: string }> => {
    try {
      const response = await fetch('http://localhost:3000/api/auth/login', {
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
          message:
            'Server error: Invalid response format. Is the backend API running at http://localhost:3000?',
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
      };

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
        message: `Connection error: ${errorMessage}. Make sure the backend API is running at http://localhost:3000`,
      };
    }
  };

  const register = async (
    email: string,
    password: string,
    name: string,
  ): Promise<{ success: boolean; message?: string }> => {
    try {
      const response = await fetch('http://localhost:3000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
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
          message:
            'Server error: Invalid response format. Is the backend API running at http://localhost:3000?',
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
        message: `Connection error: ${errorMessage}. Make sure the backend API is running at http://localhost:3000`,
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
