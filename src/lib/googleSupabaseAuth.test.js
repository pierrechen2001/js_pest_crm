import { supabase } from './supabaseClient';
import { signInToSupabaseWithGoogleToken } from './googleSupabaseAuth';

jest.mock('./supabaseClient', () => ({
  supabase: {
    auth: {
      getSession: jest.fn(),
      signInWithIdToken: jest.fn(),
    },
  },
}));

describe('signInToSupabaseWithGoogleToken', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('reuses an existing Supabase session without exchanging the Google token', async () => {
    const session = { user: { id: 'user-1', email: 'user@example.com' } };
    supabase.auth.getSession.mockResolvedValue({
      data: { session },
      error: null,
    });

    const result = await signInToSupabaseWithGoogleToken('google-token');

    expect(result).toEqual({
      data: { session, user: session.user },
      reusedSession: true,
    });
    expect(supabase.auth.signInWithIdToken).not.toHaveBeenCalled();
  });

  it('deduplicates simultaneous Google token exchanges', async () => {
    const signedInData = {
      session: { access_token: 'access-token' },
      user: { id: 'user-1', email: 'user@example.com' },
    };
    supabase.auth.getSession.mockResolvedValue({
      data: { session: null },
      error: null,
    });
    supabase.auth.signInWithIdToken.mockResolvedValue({
      data: signedInData,
      error: null,
    });

    const [firstResult, secondResult] = await Promise.all([
      signInToSupabaseWithGoogleToken('google-token'),
      signInToSupabaseWithGoogleToken('google-token'),
    ]);

    expect(firstResult).toEqual({ data: signedInData, reusedSession: false });
    expect(secondResult).toEqual(firstResult);
    expect(supabase.auth.getSession).toHaveBeenCalledTimes(1);
    expect(supabase.auth.signInWithIdToken).toHaveBeenCalledTimes(1);
  });
});
