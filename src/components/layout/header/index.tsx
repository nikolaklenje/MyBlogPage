import { FC, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
export const Header: FC = () => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  useEffect(() => setIsOpen(false), [router]);

  return (
    <div className="header-container relative w-full h-16 text-[#64ffda]">
      <div className="flex flex-row center justify-between p-4 pl-16 pr-16">
        <Link href="/">
          {" "}
          <div className="font-black mt-5 animate__animated animate__fadeInDown uppercase">
            nicode
          </div>
        </Link>
        <div className="flex-row flex">
          <ul className="flex flex-row center space-x-4">
            <li className="lg:hidden mt-1 ">
              <button
                onClick={toggleMenu}
                className="flex items-center text-[#64ffda] p-3"
              >
                <svg
                  className="block h-8 w-8 fill-current"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <title>Mobile menu</title>
                  <path d="M0 3h20v2H0V3zm0 6h20v2H0V9zm0 6h20v2H0v-2z"></path>
                </svg>
              </button>
            </li>
            <span className="hidden lg:flex mt-3 pt-1">
              <li className="animate__animated animate__fadeInDownBig">
                <Link href="/">
                  01.{" "}
                  <span className="text-white hover:text-[#64ffda]">Home</span>
                </Link>
              </li>
              <li className="animate__animated animate__fadeInDownBig ml-2">
                <Link href="/blogs">
                  02.{" "}
                  <span className="text-white hover:text-[#64ffda]">Blogs</span>
                </Link>{" "}
              </li>
              <li className="animate__animated animate__fadeInDownBig ml-2">
                <Link href={"/signin"}>
                  03.{" "}
                  <span className="text-white hover:text-[#64ffda]">
                    Sign In
                  </span>
                </Link>
              </li>
            </span>
          </ul>
          <div className="hidden lg:flex h-fit border-2 block animate__animated animate__fadeInUpBig  text-[#64ffda] ml-4 mt-0 p-4 rounded-md border-[#64ffda]">
            <a
              href="Nikola_Stankovic_Resume.pdf"
              download="NikolaStankovicResume"
            >
              Resume
            </a>
          </div>
          {isOpen ? (
            <div className="relative z-50 flex">
              <div className="fixed inset-0 bg-gray-800 opacity-25"></div>
              <nav className="fixed top-0 left-0 bottom-0 flex flex-col w-full py-6 px-6 bg-[#0a192f] border-r overflow-y-auto">
                <div className="flex items-center mb-8">
                  <Link href="/">
                    {" "}
                    <div className="font-black animate__animated animate__fadeInDown">
                      NICODE
                    </div>
                  </Link>
                  <button onClick={toggleMenu} className="fixed right-12">
                    <svg
                      className="h-6 w-6 text-gray-400 cursor-pointer hover:text-gray-500"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M6 18L18 6M6 6l12 12"
                      ></path>
                    </svg>
                  </button>
                </div>

                <div>
                  <ul>
                    <li className="animate__animated animate__fadeInDownBig mb-1 hover:bg-[#0f2546] hover:text-[#64ffda] rounded">
                      01.
                      <Link
                        href="/"
                        className="p-4 text-sm font-semibold text-gray-400 "
                      >
                        <span className="text-white ">Home</span>
                      </Link>{" "}
                    </li>
                    <li className="animate__animated animate__fadeInDownBig mb-1 hover:bg-[#0f2546] hover:text-[#64ffda] rounded">
                      02.
                      <Link
                        href="/blogs"
                        className="p-4 text-sm font-semibold text-gray-400 "
                      >
                        <span className="text-white ">Blogs</span>
                      </Link>{" "}
                    </li>
                    <li className="animate__animated animate__fadeInDownBig mb-1 hover:bg-[#0f2546] hover:text-[#64ffda] rounded">
                      03.
                      <Link
                        href={"/signin"}
                        className="p-4 text-sm font-semibold text-gray-400 "
                      >
                        <span className="text-white ">Sign In</span>
                      </Link>{" "}
                    </li>
                  </ul>
                  <div className="h-fit border-2 block animate__animated animate__fadeInUpBig text-center  text-[#64ffda] mt-8 p-4 rounded-md border-[#64ffda]">
                    <a
                      href="Nikola_Stankovic_Resume.pdf"
                      download="NikolaStankovicResume"
                    >
                      Resume
                    </a>
                  </div>
                </div>
                <div className="mt-auto">
                  <p className="my-4 text-xs text-center text-gray-400">
                    <span>Copyright © 2024</span>
                  </p>
                </div>
              </nav>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};
