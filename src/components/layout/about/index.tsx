import { FC } from "react";
import Image from "next/image";
import lex from "../../../../public/lex.jpeg";

export const About: FC = () => {
  return (
    <div className="flex flex-col w-2/3 items-center ">
      <div className="flex flex-col">
        <div className="flex flex-row ">
          <h1 className="text-3xl font-semibold text-white ">
            <span className="text-[#64ffda] mr-4">01.</span>About me
          </h1>
          <div className="h-[2px] mt-5 ml-2 w-48 bg-[#ccd6f6]"></div>
        </div>
        <div className="flex flex-row  ">
          <div className="flex w-1/2 flex-col">
            <p className="text-[#ccd6f6] mt-6 text-lg">
              Front End developer with industry experience building websites and
              web applications. <br></br>I specialize in JavaScript and have
              professional experience working with C++, Typescript and Python. I
              also have experience working with Next and React.<br></br> Here
              are a few technologies I’ve been working with recently:
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
