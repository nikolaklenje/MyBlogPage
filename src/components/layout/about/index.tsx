import { FC } from 'react';
import Image from 'next/image';

export const About: FC = () => {
  return (
    <div className="animate__animated animate__fadeIn animate__delay-1s w-2/3 items-center">
      <div className="flex flex-col">
        <div className="flex flex-row">
          <h1 className="text-3xl font-semibold text-white">
            <span className="mr-4 text-[#64ffda]">01.</span>About me
          </h1>
          <div className="mt-5 ml-2 h-[2px] w-48 bg-[#ccd6f6]"></div>
        </div>
        <div className="md: flex flex-col-reverse flex-row justify-between lg:flex-row">
          <div className="flex flex-col lg:w-1/2">
            <p className="mt-6 text-lg text-[#ccd6f6]">
              Specialized in video-streaming app design and development, with a strong background in
              implementing DRM configurations, developing VOD and live streaming players, and
              enhancing playback features. Successfully migrated video players to improve
              performance, designed and implemented ad managers, and collaborated with
              cross-functional platforms.
            </p>
            <div className="mt-8 flex flex-row text-[#64ffda]">
              <ul>
                <li>JavaScript (ES6+) </li>
                <li>TypeScript</li>
                <li>Phyton</li>
              </ul>
              <ul className="mr-auto ml-auto">
                <li>React</li>
                <li>Nextjs</li>
                <li>Node.js</li>
              </ul>
            </div>
          </div>
          <div>
            <Image width={400} src="/nicode-ai-logo-square.png" height={400} alt="Nicode logo" />
          </div>
        </div>
      </div>
    </div>
  );
};
