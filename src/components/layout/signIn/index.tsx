import { FC, useState } from "react";

export const SignIn: FC = () => {
  const [isSignUp, setIsSignUp] = useState(true);

  return (
    <>
      {isSignUp ? (
        <div className="flex flex-col items-center mt-48">
          {" "}
          <h1 className="text-6xl font-semibold text-white ">Sign In</h1>
          <div className=" my-20 mx-auto md:px-6">
            <section className="mb-32 text-center">
              <div className="flex flex-wrap justify-center">
                <form className="w-full shrink-0 grow-0 basis-auto ">
                  <div className="relative mb-6">
                    <input
                      type="text"
                      className="text-white block min-h-[auto] w-full rounded border-[#64ffda] border-2 bg-transparent py-[0.32rem] px-3 leading-[1.6] outline-none transition-all duration-200 ease-linear focus:placeholder:opacity-100  data-[te-input-state-active]:placeholder:opacity-100 motion-reduce:transition-none dark:text-neutral-200"
                      placeholder="Name"
                      name="name"
                    />
                  </div>
                  <div className="relative mb-3">
                    <input
                      type="email"
                      className="text-white block min-h-[auto] w-full rounded border-2 border-[#64ffda] bg-transparent py-[0.32rem] px-3 leading-[1.6] outline-none transition-all duration-200 ease-linear focus:placeholder:opacity-100  data-[te-input-state-active]:placeholder:opacity-100 motion-reduce:transition-none dark:text-neutral-200"
                      placeholder="Email address"
                      name="email"
                    />
                  </div>
                  <p
                    className="text-white mb-4"
                    onClick={() => setIsSignUp(false)}
                  >
                    Dont have an account?
                  </p>
                  <input
                    type="Submit"
                    defaultValue="Sign In"
                    className="inline-block w-full rounded border-[#64ffda] bg-primary px-6 pt-2.5 pb-2 text-xs font-medium uppercase leading-normal
                   text-[#64ffda]  shadow-[0_4px_9px_-4px_#64ffda] transition duration-150 ease-in-out hover:bg-primary-600 hover:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)]
                    focus:bg-primary-600 focus:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:outline-none focus:ring-0 active:bg-primary-700 active:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)]"
                  />
                </form>
              </div>
            </section>
          </div>
        </div>
      ) : (
        <div className="flex flex-col  items-center mt-48">
          {" "}
          <h1 className="text-6xl font-semibold text-white ">Sign Up</h1>
          <div className=" my-20 mx-auto md:px-6">
            <section className="mb-32 text-center">
              <div className="flex flex-wrap justify-center">
                <form className="w-full shrink-0 grow-0 basis-auto ">
                  <div className="relative mb-6">
                    <input
                      type="text"
                      className="text-white block min-h-[auto] w-full rounded border-[#64ffda] border-2 bg-transparent py-[0.32rem] px-3 leading-[1.6] outline-none transition-all duration-200 ease-linear focus:placeholder:opacity-100  data-[te-input-state-active]:placeholder:opacity-100 motion-reduce:transition-none dark:text-neutral-200"
                      placeholder="Name"
                      name="name"
                    />
                  </div>
                  <div className="relative mb-6">
                    <input
                      type="email"
                      className="text-white block min-h-[auto] w-full rounded border-2 border-[#64ffda] bg-transparent py-[0.32rem] px-3 leading-[1.6] outline-none transition-all duration-200 ease-linear focus:placeholder:opacity-100  data-[te-input-state-active]:placeholder:opacity-100 motion-reduce:transition-none dark:text-neutral-200"
                      placeholder="Email address"
                      name="email"
                    />
                  </div>
                  <div className="relative mb-6">
                    <input
                      type="password"
                      className="text-white block min-h-[auto] w-full rounded border-[#64ffda] border-2 bg-transparent py-[0.32rem] px-3 leading-[1.6] outline-none transition-all duration-200 ease-linear focus:placeholder:opacity-100  data-[te-input-state-active]:placeholder:opacity-100 motion-reduce:transition-none dark:text-neutral-200"
                      placeholder="Password"
                      name="name"
                    />
                  </div>
                  <div className="relative mb-4">
                    <input
                      type="password"
                      className="text-white block min-h-[auto] w-full rounded border-[#64ffda] border-2 bg-transparent py-[0.32rem] px-3 leading-[1.6] outline-none transition-all duration-200 ease-linear focus:placeholder:opacity-100  data-[te-input-state-active]:placeholder:opacity-100 motion-reduce:transition-none dark:text-neutral-200"
                      placeholder="Confirm Password"
                      name="password"
                    />
                  </div>
                  <p
                    className="text-white mb-4"
                    onClick={() => setIsSignUp(true)}
                  >
                    Already have account? Sign In
                  </p>
                  <input
                    type="Submit"
                    defaultValue="Sign Up"
                    className="inline-block w-full rounded border-[#64ffda] bg-primary px-6 pt-2.5 pb-2 text-xs font-medium uppercase leading-normal
                   text-[#64ffda]  shadow-[0_4px_9px_-4px_#64ffda] transition duration-150 ease-in-out hover:bg-primary-600 hover:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)]
                    focus:bg-primary-600 focus:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:outline-none focus:ring-0 active:bg-primary-700 active:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)]"
                  />
                </form>
              </div>
            </section>
          </div>
        </div>
      )}
    </>
  );
};
