import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { supabase } from '@/lib/supabase';
import type { User, Session, AuthError } from '@supabase/supabase-js';

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null);
  const session = ref<Session | null>(null);
  const loading = ref(true);
  const error = ref<string | null>(null);

  // Getters
  const isAuthenticated = computed(() => !!user.value);
  const userId = computed(() => user.value?.id || null);
  const userEmail = computed(() => user.value?.email || null);

  // Initialize auth state listener
  function initAuth() {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
      session.value = initialSession;
      user.value = initialSession?.user ?? null;
      loading.value = false;
      
      // Clean up URL hash after OAuth callback (Supabase returns tokens in hash)
      if (window.location.hash && window.location.hash.includes('access_token')) {
        window.history.replaceState({}, '', window.location.pathname);
      }
    });

    // Listen for auth changes
    supabase.auth.onAuthStateChange((_event, newSession) => {
      session.value = newSession;
      user.value = newSession?.user ?? null;
      loading.value = false;
      
      // Clean up URL hash after auth state change
      if (window.location.hash) {
        window.history.replaceState({}, '', window.location.pathname);
      }
    });
  }

  // Sign in with email and password
  async function signInWithEmail(email: string, password: string) {
    loading.value = true;
    error.value = null;

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        error.value = authError.message;
        return { success: false, error: authError };
      }

      user.value = data.user;
      session.value = data.session;
      return { success: true, data };
    } catch (e) {
      const err = e as AuthError;
      error.value = err.message;
      return { success: false, error: err };
    } finally {
      loading.value = false;
    }
  }

  // Sign up with email and password
  async function signUpWithEmail(email: string, password: string) {
    loading.value = true;
    error.value = null;

    try {
      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) {
        error.value = authError.message;
        return { success: false, error: authError };
      }

      // Note: User may need to confirm email before being fully authenticated
      user.value = data.user;
      session.value = data.session;
      return { success: true, data };
    } catch (e) {
      const err = e as AuthError;
      error.value = err.message;
      return { success: false, error: err };
    } finally {
      loading.value = false;
    }
  }

  // Sign in with Google OAuth
  async function signInWithGoogle() {
    loading.value = true;
    error.value = null;

    try {
      const { data, error: authError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
        },
      });

      if (authError) {
        error.value = authError.message;
        return { success: false, error: authError };
      }

      return { success: true, data };
    } catch (e) {
      const err = e as AuthError;
      error.value = err.message;
      return { success: false, error: err };
    } finally {
      loading.value = false;
    }
  }

  // Sign out
  async function signOut() {
    loading.value = true;
    error.value = null;

    try {
      const { error: authError } = await supabase.auth.signOut();

      if (authError) {
        error.value = authError.message;
        return { success: false, error: authError };
      }

      user.value = null;
      session.value = null;
      return { success: true };
    } catch (e) {
      const err = e as AuthError;
      error.value = err.message;
      return { success: false, error: err };
    } finally {
      loading.value = false;
    }
  }

  // Get current access token (for API calls)
  async function getAccessToken(): Promise<string | null> {
    const { data } = await supabase.auth.getSession();
    return data.session?.access_token ?? null;
  }

  // Clear error
  function clearError() {
    error.value = null;
  }

  return {
    // State
    user,
    session,
    loading,
    error,
    // Getters
    isAuthenticated,
    userId,
    userEmail,
    // Actions
    initAuth,
    signInWithEmail,
    signUpWithEmail,
    signInWithGoogle,
    signOut,
    getAccessToken,
    clearError,
  };
});
