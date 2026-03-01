'use client';

import { useAuth } from '@clerk/nextjs';
import { useEffect } from 'react';
import { setAuthToken } from '@/lib/api';

export default function AxiosAuthProvider({ children }: { children: React.ReactNode }) {
  const { getToken, isSignedIn } = useAuth();

  useEffect(() => {
    const syncToken = async () => {
      if (isSignedIn) {
        // Get the JWT token from Clerk
        const token = await getToken();
        // Set it in our Axios instance
        setAuthToken(token);
      } else {
        // Clear token if signed out
        setAuthToken(null);
      }
    };

    syncToken();
  }, [getToken, isSignedIn]);

  return <>{children}</>;
}
