import { supabase } from '@/library/supabaseApi';

export const signInFlow = async (userEmail: string, userPassword: string, router: any) => {
  try {
    await supabase.auth.signInWithPassword({
      email: userEmail,
      password: userPassword,
    });
    router.push('/');
  } catch (error: any) {
    throw new Error(error.message || 'An error occurred during sign-in. ');
  }
};

export const signUpFlow = async (newUserEmail: string, newUserPassword: string) => {
  try {
    await supabase.auth.signUp({
      email: newUserEmail,
      password: newUserPassword,
    });
  } catch (error: any) {
    throw new Error(error.message || 'An error occurred! Try again.');
  }
};

export const resetPasswordFlow = async (userEmail: string) => {
  try {
    await supabase.auth.resetPasswordForEmail(userEmail, {
      redirectTo: 'http://localhost:3000/reset-password',
    });
  } catch (error: any) {
    throw new Error(error.message || 'An error occurred! Try again.');
  }
};

export const signOut = async () => {
  try {
    await supabase.auth.signOut();
  } catch (error) {
    console.log(error);
  }
};
