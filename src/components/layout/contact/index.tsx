import { FC } from "react";

export const Contact: FC = () => {
  return (
    <div className="flex flex-col w-2/3 items-center mt-48">
      <h1 className="text-6xl font-semibold text-white mt-6">Get In Touch</h1>
      <p className="text-[#ccd6f6] leading-normal mt-6 w-2/3">
        Although I’m not currently looking for any new opportunities, my inbox
        is always open. Whether you have a question or just want to say hi, I’ll
        try my best to get back to you!
      </p>

      <div className="container my-24 mx-auto md:px-6">
        <section className="mb-32 text-center">
          <div className="flex flex-wrap justify-center">
            <div className="w-full shrink-0 grow-0 basis-auto md:w-8/12 lg:w-7/12 xl:w-6/12">
              <form>
                <div className="relative mb-6">
                  <input
                    type="text"
                    className="text-white block min-h-[auto] w-full rounded border-[#64ffda] border-2 bg-transparent py-[0.32rem] px-3 leading-[1.6] outline-none transition-all duration-200 ease-linear focus:placeholder:opacity-100  data-[te-input-state-active]:placeholder:opacity-100 motion-reduce:transition-none dark:text-neutral-200"
                    placeholder="Name"
                  />
                </div>
                <div className="relative mb-6">
                  <input
                    type="email"
                    className="tet-white block min-h-[auto] w-full rounded border-2 border-[#64ffda] bg-transparent py-[0.32rem] px-3 leading-[1.6] outline-none transition-all duration-200 ease-linear focus:placeholder:opacity-100  data-[te-input-state-active]:placeholder:opacity-100 motion-reduce:transition-none dark:text-neutral-200"
                    placeholder="Email address"
                  />
                </div>
                <button
                  type="button"
                  className="mb-6 inline-block w-full rounded border-[#64ffda] bg-primary px-6 pt-2.5 pb-2 text-xs font-medium uppercase leading-normal
                   text-[#64ffda]  shadow-[0_4px_9px_-4px_#64ffda] transition duration-150 ease-in-out hover:bg-primary-600 hover:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)]
                    focus:bg-primary-600 focus:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:outline-none focus:ring-0 active:bg-primary-700 active:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)]"
                >
                  Subscribe
                </button>
              </form>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

//border-2 block text-[#64ffda] w-48 pl-6 mt-6 p-4  rounded-md border-[#64ffda]
