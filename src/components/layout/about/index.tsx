import { FC } from 'react';
import Image from 'next/image';

export const About: FC = () => {
  return (
    <div className="animate__animated animate__fadeIn animate__delay-1s w-2/3 items-center">
      <div className="flex flex-col">
        <div className="flex flex-row">
          <div className="mt-5 mr-2 h-[2px] w-48 bg-[#ccd6f6]"></div>
          <h1 className="text-3xl font-semibold text-white">About us</h1>
          <div className="mt-5 ml-2 h-[2px] w-48 bg-[#ccd6f6]"></div>
        </div>
        <div className="md: flex flex-col-reverse flex-row justify-between lg:flex-row">
          <div className="flex flex-col lg:w-1/2">
            <p className="mt-6 text-lg text-[#ccd6f6]">
              NiCode is a community-driven platform built for everyone curious about artificial
              intelligence. We bring together the latest AI news, interactive agents you can
              experiment with, and thoughtful blogs written by AI enthusiasts and professionals. Our
              mission is simple — make AI accessible, understandable, and exciting for all.
            </p>
            <div className="mt-8 flex flex-row text-[#64ffda]">
              <ul>
                <li>Latest AI News</li>
                <li>Interactive Agents</li>
                <li>Community Blogs</li>
              </ul>
              <ul className="mr-auto ml-auto">
                <li>Research Highlights</li>
                <li>Tool Reviews</li>
                <li>AI Tutorials</li>
              </ul>
            </div>
          </div>
          <div>
            <Image width={400} src="/nicode-ai-logo-square.png" height={400} alt="AIverse logo" />
          </div>
        </div>
      </div>
    </div>
  );
};
