import { FC } from "react";
import Image from "next/image";
import lex from "../../../../public/lex.jpeg";

export const About: FC = () => {
  return (
    <div className="w-2/3 items-center animate__animated animate__fadeIn animate__delay-1s ">
      <div className="flex flex-col">
        <div className="flex flex-row ">
          <h1 className="text-3xl font-semibold text-white ">
            <span className="text-[#64ffda] mr-4">01.</span>About me
          </h1>
          <div className="h-[2px] mt-5 ml-2 w-48 bg-[#ccd6f6]"></div>
        </div>
        <div className="flex flex-row md: flex-col-reverse lg:flex-row ">
          <div className="flex lg:w-1/2 flex-col">
            <p className="text-[#ccd6f6] mt-6 text-lg">
              Specialized in video-streaming app design and development, with a
              strong background in implementing DRM configurations, developing
              VOD and live streaming players, and enhancing playback features.
              Successfully migrated video players to improve performance,
              designed and implemented ad managers, and collaborated with
              cross-functional platforms.
            </p>
            <div className="flex flex-row mt-8 text-[#64ffda]">
              <ul>
                <li>JavaScript (ES6+) </li>
                <li>TypeScript</li>
                <li>Phyton</li>
              </ul>
              <ul className="ml-auto mr-auto">
                <li>React</li>
                <li>React Native</li>
                <li>Node.js</li>
              </ul>
            </div>
          </div>
          <div>
            <Image width={400} src={lex} alt={""}></Image>
          </div>
        </div>
      </div>
    </div>
  );
};
