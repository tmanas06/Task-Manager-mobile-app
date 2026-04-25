import React, { createContext, useState, useContext, useEffect } from 'react';
import { useAuth as useClerkAuth, useUser, useOrganization, useOrganizationList } from '@clerk/clerk-expo';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { loginWithClerk } from '../api/auth';
import { syncOrganization as apiSyncOrg } from '../api/orgs';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const { isLoaded, isSignedIn, getToken, signOut } = useClerkAuth();
  const { user: clerkUser } = useUser();
  const { organization: activeOrg, isLoaded: orgLoaded } = useOrganization();
  const { userMemberships, isLoaded: listLoaded } = useOrganizationList({
    userMemberships: true,
  });

  const [user, setUser] = useState(null);
  const [activeOrgDetails, setActiveOrgDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Derive admin role from organization membership
  const isAdmin = activeOrgDetails?.clerkOrgId && (
    user?.role === 'admin' || 
    userMemberships.data?.find(m => m.organization.id === activeOrg?.id)?.role === 'org:admin'
  );

  useEffect(() => {
    let isMounted = true;

    const syncUserAndOrg = async () => {
      if (isLoaded && isSignedIn && clerkUser) {
        try {
          const storedToken = await AsyncStorage.getItem('authToken');
          const token = await getToken();
          if (!token) return;

          // Sync User if state is missing or token is missing from storage
          if (!user || !storedToken) {
            const response = await loginWithClerk(token, clerkUser);
            if (response.success && isMounted) {
              await AsyncStorage.setItem('authToken', response.data.token);
              setUser(response.data.user);
            }
          }

          // Sync Organization details if one is active
          if (activeOrg && orgLoaded) {
            await AsyncStorage.setItem('activeOrgId', activeOrg.id);
            if (activeOrgDetails?.clerkOrgId !== activeOrg.id) {
              const orgResponse = await apiSyncOrg(activeOrg.id, activeOrg.name);
              if (orgResponse.success && isMounted) {
                setActiveOrgDetails(orgResponse.data);
              }
            }
          } else if (activeOrgDetails !== null && isMounted) {
            await AsyncStorage.removeItem('activeOrgId');
            setActiveOrgDetails(null);
          }
        } catch (error) {
          console.error('Failed to sync auth with backend:', error);
        } finally {
          if (isMounted) setIsLoading(false);
        }
      } else if (isLoaded && !isSignedIn) {
        await AsyncStorage.removeItem('authToken');
        if (isMounted) {
          setUser(null);
          setActiveOrgDetails(null);
          setIsLoading(false);
        }
      }
    };

    syncUserAndOrg();

    return () => { isMounted = false; };
  }, [isLoaded, isSignedIn, clerkUser, activeOrg, orgLoaded]);

  const logout = async () => {
    try {
      await signOut();
      await AsyncStorage.removeItem('authToken');
      setUser(null);
      setActiveOrgDetails(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        activeOrganization: activeOrgDetails,
        isAdmin,
        isAuthenticated: isSignedIn,
        isLoading: !isLoaded || (isSignedIn && (!orgLoaded || !listLoaded)) || isLoading,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext); 
export default AuthContext;
