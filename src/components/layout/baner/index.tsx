import { FC } from 'react';

export const Baner: FC = () => {
  return (
    <div className="animate__animated animate__fadeIn animate__delay-1s sm: items-left flex flex-col p-12 text-white lg:p-36">
      <div className="text-2xl text-[#64ffda]">
        <h1>Welcome to</h1>
      </div>
      <div>
        <h2 className="mt-4 text-6xl font-semibold">NiCode.</h2>
      </div>
      <div>
        <h3 className="mt-4 text-6xl font-semibold text-[#ccd6f6]">Your hub for everything AI.</h3>
      </div>
      <div>
        <p className="mt-6 leading-normal text-[#ccd6f6]">
          Stay ahead of the curve with the latest AI news, hands-on agents you can try right in your
          browser, and in-depth blogs from the AI community. Whether you're a researcher, developer,
          or simply curious about the future — this is your place to explore, learn, and experiment
          with artificial intelligence.
        </p>
      </div>
    </div>
  );
};
