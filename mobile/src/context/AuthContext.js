import React, { createContext, useState, useContext, useEffect } from 'react';
import { useAuth as useClerkAuth, useUser } from '@clerk/clerk-expo';
import { loginWithClerk } from '../api/auth';

const AuthContext = createContext();

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const { isLoaded, isSignedIn, getToken, signOut } = useClerkAuth();
  const { user: clerkUser } = useUser();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    const syncUserWithBackend = async () => {
      if (isLoaded && isSignedIn && clerkUser) {
        try {
          const token = await getToken();
          const response = await loginWithClerk(token, clerkUser);
          
          if (response.success) {
            setUser(response.data.user);
          }
        } catch (error) {
          console.error('Failed to sync user with backend:', error);
        } finally {
          setIsLoading(false);
        }
      } else if (isLoaded && !isSignedIn) {
        setUser(null);
        setIsLoading(false);
      }
    };

    syncUserWithBackend();
  }, [isLoaded, isSignedIn, clerkUser]);

  const logout = async () => {
    try {
      await signOut();
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAdmin,
        isAuthenticated: isSignedIn,
        isLoading: !isLoaded || isLoading,
        isSignedIn,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext); 
export default AuthContext;
