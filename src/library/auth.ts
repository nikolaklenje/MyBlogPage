import { supabase } from "@/library/supabaseApi";

export const signInFlow = async (
  userEmail: string,
  userPassword: string,
  router: any
) => {
  try {
    const signInAttempt = await supabase.auth.signInWithPassword({
      email: userEmail,
      password: userPassword,
    });
    const { error } = signInAttempt;
    if (error) {
      //   setErrorMessage(error.message);
      console.log("SignIn failed", error);
    } else {
      router.push("/");
    }
  } catch (error) {
    console.log(error);
  }
};
