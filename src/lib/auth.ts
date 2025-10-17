import { supabase } from './supabase';

/* SIGN IN / SIGN UP WITH EMAIL */

export async function requestEmailOtp(email: string) {
    const { data, error } = await supabase.auth.signInWithOtp({
        email,
        options: {
            shouldCreateUser: true
        },
    });
    if (error) throw error;
    return data;
}

export async function verifyEmailOtp(email: string, token: string) {
    const { data, error } = await supabase.auth.verifyOtp({
        email,
        token,
        type: "email",
    });
    if (error) throw error;
    return data.session ?? null;
}

/* SIGN IN / SIGN UP WITH APPLE */

export async function signInWithApple(identityToken: string, nonce: string) {
    try {      
      const { data, error } = await supabase.auth.signInWithIdToken({
        provider: 'apple',
        token: identityToken,
        nonce: nonce,
      });

      if (error) {
        // Handle authentication error
        return {
          success: false,
          message: error.message || 'Failed to sign in with Apple. Please try again.'
        };
      }
      return {
        success: true,
        message: 'Successfully signed in with Apple!',
        user: data.user
      };
    } catch (error) {
      // Handle unexpected error
      return {
        success: false,
        message: 'An unexpected error occurred during Apple sign-in.'
      };
    }
}

/* HELPERS */

export async function signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
}

export async function getSession() {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return data.session ?? null;
}

export async function getUser() {
    const { data, error } = await supabase.auth.getUser();
    if (error) throw error;
    return data.user ?? null;
}

// Note: Database functions that require RLS policies or admin access
// should be moved to API routes or server components
// These functions are kept here for reference but may need server-side implementation

export async function updateUserMetadata(metadata: Record<string, any>) {
    const { data, error } = await supabase.auth.updateUser({
        data: metadata
    });
    if (error) throw error;
    return data.user;
}

