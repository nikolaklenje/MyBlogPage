import { supabase } from '@/library/supabaseApi';
import { NextRouter } from 'next/router';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
export const signInFlow = async (userEmail: string, userPassword: string, router: NextRouter) => {
  const { error } = await supabase.auth.signInWithPassword({
    email: userEmail,
    password: userPassword,
  });

  if (error) throw new Error(error.message || 'An error occurred during sign-in.');
  router.push('/');
};

export const signUpFlow = async (newUserEmail: string, newUserPassword: string) => {
  const { error } = await supabase.auth.signUp({
    email: newUserEmail,
    password: newUserPassword,
  });
  if (error) throw new Error(error.message || 'An error occurred! Try again.');
};

export const resetPasswordFlow = async (userEmail: string) => {
  const { error } = await supabase.auth.resetPasswordForEmail(userEmail, {
    redirectTo: `${SITE_URL}/reset-password`,
  });
  if (error) throw new Error(error.message || 'An error occurred! Try again.');
};

export const signOut = async (router: NextRouter) => {
  const { error } = await supabase.auth.signOut();
  if (error) throw new Error(error.message || 'An error occurred! Try again.');
  router.push('/');
};
