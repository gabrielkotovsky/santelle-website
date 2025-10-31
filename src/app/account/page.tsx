'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import ProtectedRoute from '@/components/ProtectedRoute';

interface ProfileData {
  email?: string;
  created_at?: string;
  subscription_status?: string;
  plan_lookup_key?: string;
  trial_end_date?: string;
  current_period_end?: string;
  stripe_customer_id?: string;
}

interface StripeSubscriptionData {
  id?: string;
  status?: string;
  current_period_start?: string;
  current_period_end?: string;
  trial_end?: string | null;
  cancel_at?: string | null;
  cancel_at_period_end?: boolean;
  plan_lookup_key?: string | null;
  plan_name?: string | null;
  billing_interval?: string | null;
  billing_interval_count?: number | null;
}

function AccountContent() {
  const { user, loading: authLoading, signOut } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [subscription, setSubscription] = useState<StripeSubscriptionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [portalLoading, setPortalLoading] = useState(false);

  useEffect(() => {
    async function fetchData() {
      if (!user) return;

      try {
        setLoading(true);
        setError(null);

        // Get the current session token
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          setError('No active session');
          setLoading(false);
          return;
        }

        // Fetch profile from API
        const profileResponse = await fetch('/api/account/profile', {
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
          },
        });

        if (!profileResponse.ok) {
          throw new Error('Failed to fetch profile');
        }

        const profileData = await profileResponse.json();
        setProfile(profileData.profile);

        // Fetch live subscription data from Stripe if customer ID exists
        if (profileData.profile?.stripe_customer_id) {
          const subscriptionResponse = await fetch('/api/account/stripe-subscription', {
            headers: {
              'Authorization': `Bearer ${session.access_token}`,
            },
          });

          if (subscriptionResponse.ok) {
            const subscriptionData = await subscriptionResponse.json();
            setSubscription(subscriptionData.subscription);
          }
        }
      } catch (err: any) {
        console.error('Error fetching data:', err);
        setError(err.message || 'Failed to load data');
      } finally {
        setLoading(false);
      }
    }

    if (user) {
      fetchData();
    }
  }, [user]);

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return 'Invalid date';
    }
  };

  const getPlanName = (lookupKey: string | null | undefined) => {
    if (!lookupKey) return 'N/A';
    
    const planMap: Record<string, string> = {
      'proactive-monthly': 'Proactive',
      'proactive-annual': 'Proactive',
      'balanced-bimonthly': 'Balanced',
      'balanced-annual': 'Balanced',
      'essential-quarterly': 'Essential',
      'essential-annual': 'Essential',
    };

    return planMap[lookupKey] || lookupKey;
  };

  const getBillingFrequency = (lookupKey: string | null | undefined, interval?: string | null, intervalCount?: number | null) => {
    // First try to use Stripe billing interval data if available
    if (interval && intervalCount) {
      if (interval === 'month') {
        if (intervalCount === 1) return 'Every month';
        if (intervalCount === 2) return 'Every 2 months';
        if (intervalCount === 3) return 'Every 3 months';
        if (intervalCount === 6) return 'Every 6 months';
        return `Every ${intervalCount} months`;
      }
      if (interval === 'year') {
        return 'Yearly';
      }
    }
    
    // Fallback to lookup key parsing
    if (!lookupKey) return 'N/A';
    
    if (lookupKey.includes('-monthly')) return 'Every month';
    if (lookupKey.includes('-bimonthly')) return 'Every 2 months';
    if (lookupKey.includes('-quarterly')) return 'Every 3 months';
    if (lookupKey.includes('-annual')) return 'Yearly';
    
    return 'N/A';
  };

  const getStatusBadgeColor = (status: string | null | undefined) => {
    if (!status) return 'bg-gray-500';
    
    const statusMap: Record<string, string> = {
      'active': 'bg-green-500',
      'trialing': 'bg-blue-500',
      'past_due': 'bg-yellow-500',
      'canceled': 'bg-red-500',
      'unpaid': 'bg-red-500',
    };

    return statusMap[status] || 'bg-gray-500';
  };

  if (authLoading || loading) {
    return (
      <main className="relative min-h-screen flex items-center justify-center">
        <div className="fixed inset-0 -z-10 flex items-center justify-center">
          <video
            src="/background_desktop.mp4"
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover hidden md:block"
            style={{ 
              objectFit: 'cover', 
              objectPosition: 'center',
              width: '100vw',
              height: '100dvh'
            }}
          />
          <div 
            className="absolute inset-0 w-full h-full block md:hidden"
            style={{
              backgroundImage: 'url(/background-mobile.jpg)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              backgroundAttachment: 'fixed',
              width: '100vw',
              height: '100dvh'
            }}
          />
          <div className="bg-white/30 absolute inset-0 backdrop-blur-lg" />
        </div>
        <div className="relative z-10 text-[#721422] text-xl">Loading...</div>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen flex items-center justify-center">
      {/* Background */}
      <div className="fixed inset-0 -z-10 flex items-center justify-center">
        <video
          src="/background_desktop.mp4"
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover hidden md:block"
          style={{ 
            objectFit: 'cover', 
            objectPosition: 'center',
            width: '100vw',
            height: '100dvh'
          }}
        />
        <div 
          className="absolute inset-0 w-full h-full block md:hidden"
          style={{
            backgroundImage: 'url(/background-mobile.jpg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            backgroundAttachment: 'fixed',
            width: '100vw',
            height: '100dvh'
          }}
        />
        <div className="bg-white/30 absolute inset-0 backdrop-blur-lg" />
      </div>

      {/* Content */}
      <div className="relative z-10 w-[95%] max-w-6xl mx-auto px-4 py-16">
        <div className="bg-white/40 backdrop-blur-md rounded-3xl p-8 md:p-12 border border-white/50">
          {/* Back Arrow - Top Left */}
          <button
            onClick={() => router.back()}
            className="mb-6 bg-white/60 text-[#721422] font-bold px-4 py-3 rounded-full hover:bg-white/80 transition-colors duration-200 border-2 border-[#721422] flex items-center gap-2"
            aria-label="Go back"
          >
            <svg 
              className="w-5 h-5" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M15 19l-7-7 7-7" 
              />
            </svg>
            <span>Back</span>
          </button>

          <h1 className="text-3xl md:text-4xl font-bold text-[#721422] mb-8 text-center">
            Account Management
          </h1>

          {error && (
            <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-xl">
              {error}
            </div>
          )}

          {/* Account Details - One Row */}
          <div className="mb-6">
            <div className="flex items-center gap-4 mb-4">
              <h2 className="text-xl md:text-2xl font-bold text-[#721422]">Account Information</h2>
              <div className="flex-1 h-px bg-[#721422]/30"></div>
            </div>
            <div className="flex flex-col md:flex-row gap-6">
              {/* Email */}
              <div className="bg-white/20 rounded-2xl p-6 flex-1">
                <h2 className="text-sm font-semibold text-[#721422]/70 mb-2">Email</h2>
                <p className="text-xl text-[#721422] font-semibold">
                  {profile?.email || user?.email || 'N/A'}
                </p>
              </div>

              {/* Joined Date */}
              <div className="bg-white/20 rounded-2xl p-6 flex-1">
                <h2 className="text-sm font-semibold text-[#721422]/70 mb-2">Joined Date</h2>
                <p className="text-xl text-[#721422] font-semibold">
                  {formatDate(profile?.created_at || user?.created_at)}
                </p>
              </div>
            </div>
          </div>

          {/* Subscription Details - One Row */}
          {(subscription || profile?.plan_lookup_key) && (
            <div className="mb-6">
              <div className="flex items-center gap-4 mb-4">
                <h2 className="text-xl md:text-2xl font-bold text-[#721422]">Subscription Information</h2>
                <div className="flex-1 h-px bg-[#721422]/30"></div>
              </div>
              <div className="flex flex-wrap gap-6">
              {/* Subscription Plan */}
              {(subscription?.plan_name || profile?.plan_lookup_key) && (
                <div className="bg-white/20 rounded-2xl p-6 flex-1 min-w-[200px]">
                  <h2 className="text-sm font-semibold text-[#721422]/70 mb-2">Subscription Plan</h2>
                  <p className="text-xl text-[#721422] font-semibold">
                    {subscription?.plan_name || getPlanName(profile?.plan_lookup_key)}
                  </p>
                </div>
              )}

              {/* Billing Frequency */}
              {(subscription || profile?.plan_lookup_key) && (
                <div className="bg-white/20 rounded-2xl p-6 flex-1 min-w-[200px]">
                  <h2 className="text-sm font-semibold text-[#721422]/70 mb-2">Billing Frequency</h2>
                  <p className="text-xl text-[#721422] font-semibold">
                    {getBillingFrequency(
                      subscription?.plan_lookup_key || profile?.plan_lookup_key,
                      subscription?.billing_interval,
                      subscription?.billing_interval_count
                    )}
                  </p>
                </div>
              )}

              {/* Subscription Status */}
              {(subscription?.status || profile?.subscription_status) && (
                <div className="bg-white/20 rounded-2xl p-6 flex-1 min-w-[200px]">
                  <h2 className="text-sm font-semibold text-[#721422]/70 mb-2">Subscription Status</h2>
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold text-white ${getStatusBadgeColor(subscription?.status || profile?.subscription_status)}`}>
                      {(subscription?.status || profile?.subscription_status || '').charAt(0).toUpperCase() + (subscription?.status || profile?.subscription_status || '').slice(1).replace('_', ' ')}
                    </span>
                  </div>
                </div>
              )}

              {/* Trial End Date */}
              {(subscription?.trial_end || profile?.trial_end_date) && (
                <div className="bg-white/20 rounded-2xl p-6 flex-1 min-w-[200px]">
                  <h2 className="text-sm font-semibold text-[#721422]/70 mb-2">Trial End Date</h2>
                  <p className="text-xl text-[#721422] font-semibold">
                    {formatDate(subscription?.trial_end || profile?.trial_end_date)}
                  </p>
                </div>
              )}

              {/* Renewal Date */}
              {(subscription?.current_period_end || profile?.current_period_end) && (
                <div className="bg-white/20 rounded-2xl p-6 flex-1 min-w-[200px]">
                  <h2 className="text-sm font-semibold text-[#721422]/70 mb-2">Renewal Date</h2>
                  <p className="text-xl text-[#721422] font-semibold">
                    {formatDate(subscription?.current_period_end || profile?.current_period_end)}
                  </p>
                </div>
              )}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="mt-8 flex flex-col gap-4">
            {/* Manage Subscription Button - Only show if customer has Stripe customer ID */}
            {profile?.stripe_customer_id && (
              <button
                onClick={async () => {
                  try {
                    setPortalLoading(true);
                    setError(null);

                    // Get the current session token
                    const { data: { session } } = await supabase.auth.getSession();
                    
                    if (!session) {
                      setError('No active session');
                      setPortalLoading(false);
                      return;
                    }

                    // Create portal session
                    const response = await fetch('/api/account/create-portal-session', {
                      method: 'POST',
                      headers: {
                        'Authorization': `Bearer ${session.access_token}`,
                        'Content-Type': 'application/json',
                      },
                    });

                    if (!response.ok) {
                      const errorData = await response.json();
                      throw new Error(errorData.error || 'Failed to create portal session');
                    }

                    const data = await response.json();
                    
                    // Redirect to Stripe billing portal
                    if (data.url) {
                      window.location.href = data.url;
                    }
                  } catch (err: any) {
                    console.error('Error creating portal session:', err);
                    setError(err.message || 'Failed to open subscription management');
                    setPortalLoading(false);
                  }
                }}
                disabled={portalLoading}
                className="w-full bg-[#721422] text-white font-bold px-6 py-4 rounded-full hover:bg-[#8a1a2a] transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {portalLoading ? 'Loading...' : 'Manage Subscription'}
              </button>
            )}

            <button
              onClick={async () => {
                try {
                  await signOut();
                  router.push('/');
                } catch (error) {
                  console.error('Error signing out:', error);
                }
              }}
              className="w-full bg-white/60 text-[#721422] font-bold px-6 py-4 rounded-full hover:bg-white/80 transition-colors duration-200 border-2 border-[#721422]"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function AccountPage() {
  return (
    <ProtectedRoute>
      <AccountContent />
    </ProtectedRoute>
  );
}

