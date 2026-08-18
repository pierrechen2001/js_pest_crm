import { supabase } from './supabaseClient';

// Both AuthContext and the login page can discover the same Google sign-in.
// Keep one shared promise so they cannot exchange the same Google token twice.
let googleSignInPromise = null;

export const signInToSupabaseWithGoogleToken = async (idToken) => {
  if (!idToken) {
    throw new Error('Google did not return an ID token');
  }

  if (googleSignInPromise) {
    return googleSignInPromise;
  }

  const signInAttempt = (async () => {
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError) {
      throw sessionError;
    }

    // A Supabase session is the source of truth for application auth. An
    // existing Google session must not trigger another ID-token exchange.
    if (session?.user) {
      return {
        data: { session, user: session.user },
        reusedSession: true,
      };
    }

    const { data, error } = await supabase.auth.signInWithIdToken({
      provider: 'google',
      token: idToken,
    });

    if (error) {
      throw error;
    }

    return { data, reusedSession: false };
  })();

  googleSignInPromise = signInAttempt;

  try {
    return await signInAttempt;
  } finally {
    if (googleSignInPromise === signInAttempt) {
      googleSignInPromise = null;
    }
  }
};
