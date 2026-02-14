import { FC, useState, useReducer } from "react";
import { supabase } from "@/library/supabaseApi";
import { useRouter } from "next/router";
import { signInFlow } from "@/library/auth";

function reducer(state: any, action: { type: string }) {
  if (action.type === "signIn") {
    return {
      message: "Sign In",
    };
  } else if (action.type === "signUp") {
    return {
      message: "Sign Up",
    };
  } else if (action.type === "resetPassword") {
    return {
      message: "Reset Password",
    };
  }
  throw Error("Unknown action");
}

export const SignIn: FC = () => {
  const [userEmail, setUserEmail] = useState("");
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserPassword, setNewUserPassword] = useState("");
  const [confirmNewUserPassword, setConfirmNewUserPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [userPassword, setUserPassword] = useState("");
  const router = useRouter();
  const [state, dispatch] = useReducer(reducer, { message: "Sign In" });

  const signUpFlow = async () => {
    if (newUserPassword !== confirmNewUserPassword) {
      setErrorMessage("Password not matching");
    } else {
      try {
        const signUpAttempt = await supabase.auth.signUp({
          email: newUserEmail,
          password: newUserPassword,
        });
        const { error } = signUpAttempt;
        if (error) {
          setErrorMessage(error.message);
          console.log(error);
        }
      } catch (error) {
        console.log(error);
      }
    }
  };

  const resetPassword = async () => {
    try {
      const resetPasswordSent = await supabase.auth.resetPasswordForEmail(
        userEmail,
        {
          redirectTo: "http://localhost:3000/resetPassword",
        },
      );
      const { error } = resetPasswordSent;
      if (error) {
        setErrorMessage(error.message);
        console.log(error);
      }
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <>
      <div className="flex flex-col items-center mt-48">
        <h1 className="text-6xl font-semibold text-white ">{state.message}</h1>

        {state.message === "Sign In" ? (
          <div className=" my-20 mx-auto md:px-6">
            <section className="mb-32 text-center">
              <div className="flex flex-wrap justify-center">
                <form
                  className="w-full shrink-0 grow-0 basis-auto"
                  method="post"
                >
                  <div className="relative mb-6">
                    <input
                      onChange={(e) => {
                        setUserEmail(e.target.value);
                      }}
                      type="email"
                      className="text-white block min-h-[auto] w-full rounded border-[#64ffda] border-2 bg-transparent py-[0.32rem] px-3 leading-[1.6] outline-none transition-all duration-200 ease-linear focus:placeholder:opacity-100  data-[te-input-state-active]:placeholder:opacity-100 motion-reduce:transition-none dark:text-neutral-200"
                      placeholder="email"
                      name="email"
                    />
                  </div>
                  <div className="relative mb-3">
                    <input
                      onChange={(e) => {
                        setUserPassword(e.target.value);
                      }}
                      type="password"
                      className="text-white block min-h-[auto] w-full rounded border-2 border-[#64ffda] bg-transparent py-[0.32rem] px-3 leading-[1.6] outline-none transition-all duration-200 ease-linear focus:placeholder:opacity-100  data-[te-input-state-active]:placeholder:opacity-100 motion-reduce:transition-none dark:text-neutral-200"
                      placeholder="password"
                      name="password"
                    />
                  </div>
                  <p
                    className="text-white mb-4 cursor-pointer"
                    onClick={() => {
                      dispatch({ type: "signUp" });
                    }}
                  >
                    Do not have an account?
                  </p>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      signInFlow(userEmail, userPassword, router);
                    }}
                    type="submit"
                    defaultValue="Sign In"
                    className="inline-block w-full rounded border-[#64ffda] bg-primary px-6 pt-2.5 pb-2 text-xs font-medium uppercase leading-normal
                   text-[#64ffda]  shadow-[0_4px_9px_-4px_#64ffda] transition duration-150 ease-in-out hover:bg-primary-600 hover:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)]
                    focus:bg-primary-600 focus:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:outline-none focus:ring-0 active:bg-primary-700 active:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)]"
                  >
                    Sign In
                  </button>
                  <p
                    className="text-white my-4 cursor-pointer"
                    onClick={() => dispatch({ type: "resetPassword" })}
                  >
                    Forgot password?
                  </p>
                </form>
              </div>
            </section>
          </div>
        ) : state.message === "Sign Up" ? (
          <div className=" my-20 mx-auto md:px-6">
            <section className="mb-32 text-center">
              <div className="flex flex-wrap justify-center">
                <form
                  method="post"
                  className="w-full shrink-0 grow-0 basis-auto "
                >
                  <div className="relative mb-6">
                    <input
                      onChange={(e) => {
                        setNewUserEmail(e.target.value);
                      }}
                      type="email"
                      className="text-white block min-h-[auto] w-full rounded border-2 border-[#64ffda] bg-transparent py-[0.32rem] px-3 leading-[1.6] outline-none transition-all duration-200 ease-linear focus:placeholder:opacity-100  data-[te-input-state-active]:placeholder:opacity-100 motion-reduce:transition-none dark:text-neutral-200"
                      placeholder="Email address"
                      name="email"
                    />
                  </div>
                  <div className="relative mb-6">
                    <input
                      onChange={(e) => setNewUserPassword(e.target.value)}
                      type="password"
                      className="text-white block min-h-[auto] w-full rounded border-[#64ffda] border-2 bg-transparent py-[0.32rem] px-3 leading-[1.6] outline-none transition-all duration-200 ease-linear focus:placeholder:opacity-100  data-[te-input-state-active]:placeholder:opacity-100 motion-reduce:transition-none dark:text-neutral-200"
                      placeholder="Password"
                      name="name"
                    />
                  </div>
                  <div className="relative mb-4">
                    <input
                      onChange={(e) =>
                        setConfirmNewUserPassword(e.target.value)
                      }
                      type="password"
                      className="text-white block min-h-[auto] w-full rounded border-[#64ffda] border-2 bg-transparent py-[0.32rem] px-3 leading-[1.6] outline-none transition-all duration-200 ease-linear focus:placeholder:opacity-100  data-[te-input-state-active]:placeholder:opacity-100 motion-reduce:transition-none dark:text-neutral-200"
                      placeholder="Confirm Password"
                      name="password"
                    />
                  </div>
                  <p className="text-red-600">{errorMessage}</p>
                  <p
                    className="text-white mb-6 cursor-pointer"
                    onClick={() => {
                      dispatch({ type: "signIn" });
                    }}
                  >
                    Already have account? Sign In
                  </p>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      signUpFlow();
                    }}
                    type="submit"
                    defaultValue="Sign Up"
                    className="inline-block w-full rounded border-[#64ffda] bg-primary px-6 pt-2.5 pb-2 text-xs font-medium uppercase leading-normal
                   text-[#64ffda]  shadow-[0_4px_9px_-4px_#64ffda] transition duration-150 ease-in-out hover:bg-primary-600 hover:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)]
                    focus:bg-primary-600 focus:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:outline-none focus:ring-0 active:bg-primary-700 active:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)]"
                  >
                    Sign Up
                  </button>
                </form>
              </div>
            </section>
          </div>
        ) : state.message === "Reset Password" ? (
          <div className=" my-20 mx-auto md:px-6">
            <section className="mb-32 text-center">
              <div className="flex flex-wrap justify-center">
                <form
                  className="w-full shrink-0 grow-0 basis-auto"
                  method="post"
                >
                  <div className="relative mb-6">
                    <input
                      onChange={(e) => {
                        setUserEmail(e.target.value);
                      }}
                      type="email"
                      className="text-white block min-h-[auto] w-full rounded border-[#64ffda] border-2 bg-transparent py-[0.32rem] px-3 leading-[1.6] outline-none transition-all duration-200 ease-linear focus:placeholder:opacity-100  data-[te-input-state-active]:placeholder:opacity-100 motion-reduce:transition-none dark:text-neutral-200"
                      placeholder="enter your email"
                      name="email"
                    />
                  </div>
                  <p
                    className="text-white mb-4 cursor-pointer"
                    onClick={() => dispatch({ type: "signUp" })}
                  >
                    Do not have an account?
                  </p>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      resetPassword();
                    }}
                    type="submit"
                    defaultValue="Reset Password"
                    className="inline-block w-full rounded border-[#64ffda] bg-primary px-6 pt-2.5 pb-2 text-xs font-medium uppercase leading-normal
                   text-[#64ffda]  shadow-[0_4px_9px_-4px_#64ffda] transition duration-150 ease-in-out hover:bg-primary-600 hover:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)]
                    focus:bg-primary-600 focus:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:outline-none focus:ring-0 active:bg-primary-700 active:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)]"
                  >
                    Reset Password
                  </button>
                </form>
              </div>
            </section>
          </div>
        ) : (
          <div className="text-white">THIS WENT Wrong</div>
        )}
      </div>
    </>
  );
};
