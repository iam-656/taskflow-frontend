'use client';

import { useAuth } from '@clerk/nextjs';
import { useEffect, useState } from 'react';
import { setAuthToken } from '@/lib/api';

export default function AxiosAuthProvider({ children }: { children: React.ReactNode }) {
  const { getToken, isSignedIn, isLoaded } = useAuth();
  const [tokenSynced, setTokenSynced] = useState(false);

  useEffect(() => {
    const syncToken = async () => {
      if (!isLoaded) return;
      
      if (isSignedIn) {
        // Get the JWT token from Clerk
        const token = await getToken();
        // Set it in our Axios instance
        setAuthToken(token);
      } else {
        // Clear token if signed out
        setAuthToken(null);
      }
      setTokenSynced(true);
    };

    syncToken();
  }, [getToken, isSignedIn, isLoaded]);

  // Wait for Clerk to load AND for the token to be synced to axios
  if (!isLoaded || (isSignedIn && !tokenSynced)) {
    return null;
  }

  return <>{children}</>;
}
