import Link from "next/link";
import { FC } from "react";

export const Baner: FC = () => {
  return (
    <div className="text-white flex flex-col  animate__animated animate__fadeIn animate__delay-1s sm: p-12 lg:p-36 items-left">
      <div className="text-[#64ffda]">
        <h1>Hi, my name is</h1>
      </div>
      <div>
        <h2 className="text-6xl font-semibold mt-6">Nikola Stankovic.</h2>
      </div>
      <div>
        <h3 className="text-6xl font-semibold text-[#ccd6f6] mt-6 ">
          I build everything from nothing.
        </h3>
      </div>
      <div>
        <p className="text-[#ccd6f6] leading-normal mt-6">
          Creative and Talented Software Developer with 6+ years of experience
          in designing user-centric, intuitive user interfaces and robust
          software solutions. Extensive expertise in React development,
          including advanced knowledge of design best practices and emerging UI
          development techniques. Proficient in connecting exceptional assets
          with users through creative UI frameworks and meticulous user
          experience optimization.
        </p>
      </div>
    </div>
  );
};
