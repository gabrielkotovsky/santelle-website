'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
}

/**
 * ProtectedRoute component that redirects unauthenticated users
 * Usage: Wrap any page or component that requires authentication
 * 
 * Example:
 * ```tsx
 * <ProtectedRoute>
 *   <YourProtectedContent />
 * </ProtectedRoute>
 * ```
 */
export default function ProtectedRoute({ 
  children, 
  redirectTo = '/auth' 
}: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Wait for auth state to load before checking
    if (!loading && !user) {
      // Redirect to auth page, preserving the intended destination
      const currentPath = window.location.pathname;
      router.push(`${redirectTo}?redirect=${encodeURIComponent(currentPath)}`);
    }
  }, [user, loading, router, redirectTo]);

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-[#721422] text-xl">Loading...</div>
      </div>
    );
  }

  // Don't render children if user is not authenticated
  // The useEffect will handle the redirect
  if (!user) {
    return null;
  }

  // User is authenticated, render children
  return <>{children}</>;
}

