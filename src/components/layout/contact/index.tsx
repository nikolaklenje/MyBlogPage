import { FC, useState } from 'react';
import { SyntheticEvent } from 'react';
import submitForm from '../../../library/submit';

export const Contact: FC = () => {
  const [isSuccess, setIsSuccess] = useState(false);
  const handleSubmit = (e: SyntheticEvent) => {
    submitForm(e, setIsSuccess);
  };

  return (
    <div className="mt-48 flex w-2/3 flex-col items-center">
      {isSuccess ? (
        <div className="animate__animated animate__bounceIn container mx-auto my-24 text-center md:px-6">
          <h1 className="mt-6 text-6xl font-semibold text-white">Message Sent!</h1>
          <p className="mt-6 w-auto leading-normal text-[#ccd6f6]">
            Thanks for reaching out! We'll get back to you soon. You can also find us on social
            networks.
          </p>
        </div>
      ) : (
        <>
          {' '}
          <h1 className="mt-6 text-6xl font-semibold text-white">Get In Touch</h1>
          <p className="mt-6 w-2/3 leading-normal text-[#ccd6f6]">
            Have a question, a story tip, or want to collaborate? Whether you'd like to contribute a
            blog post, suggest an AI tool to feature, or just say hello — our inbox is always open
            and we'll do our best to get back to you!
          </p>
          <div className="container mx-auto my-24 md:px-6">
            <section className="mb-32 text-center">
              <div className="flex flex-wrap justify-center">
                <div className="w-full shrink-0 grow-0 basis-auto md:w-8/12 lg:w-7/12 xl:w-6/12">
                  <form onSubmit={handleSubmit}>
                    <div className="relative mb-6">
                      <input
                        type="text"
                        className="block min-h-[auto] w-full rounded border-2 border-[#64ffda] bg-transparent px-3 py-[0.32rem] leading-[1.6] text-white transition-all duration-200 ease-linear outline-none focus:placeholder:opacity-100 data-[te-input-state-active]:placeholder:opacity-100 motion-reduce:transition-none dark:text-neutral-200"
                        placeholder="Name"
                        name="name"
                      />
                    </div>
                    <div className="relative mb-6">
                      <input
                        type="email"
                        className="block min-h-[auto] w-full rounded border-2 border-[#64ffda] bg-transparent px-3 py-[0.32rem] leading-[1.6] text-white transition-all duration-200 ease-linear outline-none focus:placeholder:opacity-100 data-[te-input-state-active]:placeholder:opacity-100 motion-reduce:transition-none dark:text-neutral-200"
                        placeholder="Email address"
                        name="email"
                      />
                    </div>
                    <div className="relative mb-6">
                      <textarea
                        className="block min-h-[auto] w-full rounded border-2 border-[#64ffda] bg-transparent px-3 py-[0.32rem] leading-[1.6] text-white transition-all duration-200 ease-linear outline-none focus:placeholder:opacity-100 data-[te-input-state-active]:placeholder:opacity-100 motion-reduce:transition-none dark:text-neutral-200"
                        placeholder="Your message"
                        name="message"
                      ></textarea>
                    </div>
                    <input
                      type="Submit"
                      defaultValue="Send Message"
                      className="bg-primary hover:bg-primary-600 focus:bg-primary-600 active:bg-primary-700 mb-6 inline-block w-full rounded border-[#64ffda] px-6 pt-2.5 pb-2 text-xs leading-normal font-medium text-[#64ffda] uppercase shadow-[0_4px_9px_-4px_#64ffda] transition duration-150 ease-in-out hover:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:ring-0 focus:outline-none active:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)]"
                    />
                  </form>
                </div>
              </div>
            </section>
          </div>
        </>
      )}
    </div>
  );
};
