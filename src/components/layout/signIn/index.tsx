import { FC, useState, useReducer } from 'react';
import { useRouter } from 'next/router';
import { signInFlow, resetPasswordFlow, signUpFlow } from '@/library/auth';

function reducer(state: any, action: { type: string }) {
  if (action.type === 'signIn') {
    return {
      message: 'Sign In',
    };
  } else if (action.type === 'signUp') {
    return {
      message: 'Sign Up',
    };
  } else if (action.type === 'resetPassword') {
    return {
      message: 'Reset Password',
    };
  }
  throw Error('Unknown action');
}

export const SignIn: FC = () => {
  const [userEmail, setUserEmail] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [confirmNewUserPassword, setConfirmNewUserPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [userPassword, setUserPassword] = useState('');
  const router = useRouter();
  const [state, dispatch] = useReducer(reducer, { message: 'Sign In' });

  return (
    <>
      <div className="mt-48 flex flex-col items-center">
        <h1 className="text-6xl font-semibold text-white">{state.message}</h1>

        {state.message === 'Sign In' ? (
          <div className="mx-auto my-20 md:px-6">
            <section className="mb-32 text-center">
              <div className="flex flex-wrap justify-center">
                <form className="w-full shrink-0 grow-0 basis-auto" method="post">
                  <div className="relative mb-6">
                    <input
                      onChange={(e) => {
                        setUserEmail(e.target.value);
                      }}
                      type="email"
                      className="block min-h-[auto] w-full rounded border-2 border-[#64ffda] bg-transparent px-3 py-[0.32rem] leading-[1.6] text-white transition-all duration-200 ease-linear outline-none focus:placeholder:opacity-100 data-[te-input-state-active]:placeholder:opacity-100 motion-reduce:transition-none dark:text-neutral-200"
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
                      className="block min-h-[auto] w-full rounded border-2 border-[#64ffda] bg-transparent px-3 py-[0.32rem] leading-[1.6] text-white transition-all duration-200 ease-linear outline-none focus:placeholder:opacity-100 data-[te-input-state-active]:placeholder:opacity-100 motion-reduce:transition-none dark:text-neutral-200"
                      placeholder="password"
                      name="password"
                    />
                  </div>
                  <p
                    className="mb-4 cursor-pointer text-white"
                    onClick={() => {
                      dispatch({ type: 'signUp' });
                    }}
                  >
                    Do not have an account?
                  </p>
                  <button
                    onClick={async (e) => {
                      e.preventDefault();
                      try {
                        await signInFlow(userEmail, userPassword, router);
                      } catch (error) {
                        setErrorMessage(
                          error instanceof Error
                            ? error.message
                            : 'An error occurred during sign-in.',
                        );
                      }
                    }}
                    type="submit"
                    defaultValue="Sign In"
                    className="bg-primary hover:bg-primary-600 focus:bg-primary-600 active:bg-primary-700 inline-block w-full rounded border-[#64ffda] px-6 pt-2.5 pb-2 text-xs leading-normal font-medium text-[#64ffda] uppercase shadow-[0_4px_9px_-4px_#64ffda] transition duration-150 ease-in-out hover:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:ring-0 focus:outline-none active:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)]"
                  >
                    Sign In
                  </button>
                  <p className="text-red-600">{errorMessage}</p>
                  <p
                    className="my-4 cursor-pointer text-white"
                    onClick={() => dispatch({ type: 'resetPassword' })}
                  >
                    Forgot password?
                  </p>
                </form>
              </div>
            </section>
          </div>
        ) : state.message === 'Sign Up' ? (
          <div className="mx-auto my-20 md:px-6">
            <section className="mb-32 text-center">
              <div className="flex flex-wrap justify-center">
                <form method="post" className="w-full shrink-0 grow-0 basis-auto">
                  <div className="relative mb-6">
                    <input
                      onChange={(e) => {
                        setNewUserEmail(e.target.value);
                      }}
                      type="email"
                      className="block min-h-[auto] w-full rounded border-2 border-[#64ffda] bg-transparent px-3 py-[0.32rem] leading-[1.6] text-white transition-all duration-200 ease-linear outline-none focus:placeholder:opacity-100 data-[te-input-state-active]:placeholder:opacity-100 motion-reduce:transition-none dark:text-neutral-200"
                      placeholder="Email address"
                      name="email"
                    />
                  </div>
                  <div className="relative mb-6">
                    <input
                      onChange={(e) => setNewUserPassword(e.target.value)}
                      type="password"
                      className="block min-h-[auto] w-full rounded border-2 border-[#64ffda] bg-transparent px-3 py-[0.32rem] leading-[1.6] text-white transition-all duration-200 ease-linear outline-none focus:placeholder:opacity-100 data-[te-input-state-active]:placeholder:opacity-100 motion-reduce:transition-none dark:text-neutral-200"
                      placeholder="Password"
                      name="name"
                    />
                  </div>
                  <div className="relative mb-4">
                    <input
                      onChange={(e) => setConfirmNewUserPassword(e.target.value)}
                      type="password"
                      className="block min-h-[auto] w-full rounded border-2 border-[#64ffda] bg-transparent px-3 py-[0.32rem] leading-[1.6] text-white transition-all duration-200 ease-linear outline-none focus:placeholder:opacity-100 data-[te-input-state-active]:placeholder:opacity-100 motion-reduce:transition-none dark:text-neutral-200"
                      placeholder="Confirm Password"
                      name="password"
                    />
                  </div>
                  <p className="text-red-600">{errorMessage}</p>
                  <p
                    className="mb-6 cursor-pointer text-white"
                    onClick={() => {
                      dispatch({ type: 'signIn' });
                    }}
                  >
                    Already have account? Sign In
                  </p>
                  <button
                    onClick={async (e) => {
                      e.preventDefault();
                      if (newUserPassword !== confirmNewUserPassword) {
                        setErrorMessage('Password not matching');
                      } else {
                        try {
                          await signUpFlow(newUserEmail, newUserPassword);
                        } catch (error) {
                          setErrorMessage(
                            error instanceof Error
                              ? error.message
                              : 'An error occurred! Try again.',
                          );
                        }
                      }
                    }}
                    type="submit"
                    defaultValue="Sign Up"
                    className="bg-primary hover:bg-primary-600 focus:bg-primary-600 active:bg-primary-700 inline-block w-full rounded border-[#64ffda] px-6 pt-2.5 pb-2 text-xs leading-normal font-medium text-[#64ffda] uppercase shadow-[0_4px_9px_-4px_#64ffda] transition duration-150 ease-in-out hover:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:ring-0 focus:outline-none active:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)]"
                  >
                    Sign Up
                  </button>
                </form>
              </div>
            </section>
          </div>
        ) : state.message === 'Reset Password' ? (
          <div className="mx-auto my-20 md:px-6">
            <section className="mb-32 text-center">
              <div className="flex flex-wrap justify-center">
                <form className="w-full shrink-0 grow-0 basis-auto" method="post">
                  <div className="relative mb-6">
                    <input
                      onChange={(e) => {
                        setUserEmail(e.target.value);
                      }}
                      type="email"
                      className="block min-h-[auto] w-full rounded border-2 border-[#64ffda] bg-transparent px-3 py-[0.32rem] leading-[1.6] text-white transition-all duration-200 ease-linear outline-none focus:placeholder:opacity-100 data-[te-input-state-active]:placeholder:opacity-100 motion-reduce:transition-none dark:text-neutral-200"
                      placeholder="enter your email"
                      name="email"
                    />
                  </div>
                  <p
                    className="mb-4 cursor-pointer text-white"
                    onClick={() => dispatch({ type: 'signUp' })}
                  >
                    Do not have an account?
                  </p>
                  <button
                    onClick={async (e) => {
                      e.preventDefault();
                      try {
                        await resetPasswordFlow(userEmail);
                      } catch (error) {
                        setErrorMessage(
                          error instanceof Error ? error.message : 'An error occurred! Try again.',
                        );
                      }
                    }}
                    type="submit"
                    defaultValue="Reset Password"
                    className="bg-primary hover:bg-primary-600 focus:bg-primary-600 active:bg-primary-700 inline-block w-full rounded border-[#64ffda] px-6 pt-2.5 pb-2 text-xs leading-normal font-medium text-[#64ffda] uppercase shadow-[0_4px_9px_-4px_#64ffda] transition duration-150 ease-in-out hover:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:ring-0 focus:outline-none active:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)]"
                  >
                    Reset Password
                  </button>
                </form>
              </div>
            </section>
          </div>
        ) : (
          <div className="text-white">THIS WENT WRONG</div>
        )}
      </div>
    </>
  );
};
