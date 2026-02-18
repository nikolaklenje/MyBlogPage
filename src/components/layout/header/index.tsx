import { FC, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
export const Header: FC = () => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  useEffect(() => setIsOpen(false), [router]);

  return (
    <div className="header-container relative h-16 w-full text-[#64ffda]">
      <div className="center flex flex-row justify-between p-4 pr-16 pl-16">
        <Link href="/">
          {' '}
          <div className="animate__animated animate__fadeInDown mt-5 font-black uppercase">
            nicode
          </div>
        </Link>
        <div className="flex flex-row">
          <ul className="center flex flex-row space-x-4">
            <li className="mt-1 lg:hidden">
              <button onClick={toggleMenu} className="flex items-center p-3 text-[#64ffda]">
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
            <span className="mt-3 hidden pt-1 lg:flex">
              <li className="animate__animated animate__fadeInDownBig">
                <Link href="/">
                  01. <span className="text-white hover:text-[#64ffda]">Home</span>
                </Link>
              </li>
              <li className="animate__animated animate__fadeInDownBig ml-2">
                <Link href="/blogs">
                  02. <span className="text-white hover:text-[#64ffda]">Blogs</span>
                </Link>{' '}
              </li>
              <li className="animate__animated animate__fadeInDownBig ml-2">
                <Link href={'/signin'}>
                  03. <span className="text-white hover:text-[#64ffda]">Sign In</span>
                </Link>
              </li>
            </span>
          </ul>
          <div className="animate__animated animate__fadeInUpBig mt-0 ml-4 block hidden h-fit rounded-md border-2 border-[#64ffda] p-4 text-[#64ffda] lg:flex">
            <a href="Nikola_Stankovic_Resume.pdf" download="NikolaStankovicResume">
              Resume
            </a>
          </div>
          {isOpen ? (
            <div className="relative z-50 flex">
              <div className="fixed inset-0 bg-gray-800 opacity-25"></div>
              <nav className="fixed top-0 bottom-0 left-0 flex w-full flex-col overflow-y-auto border-r bg-[#0a192f] px-6 py-6">
                <div className="mb-8 flex items-center">
                  <Link href="/">
                    {' '}
                    <div className="animate__animated animate__fadeInDown font-black">NICODE</div>
                  </Link>
                  <button onClick={toggleMenu} className="fixed right-12">
                    <svg
                      className="h-6 w-6 cursor-pointer text-gray-400 hover:text-gray-500"
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
                    <li className="animate__animated animate__fadeInDownBig mb-1 rounded hover:bg-[#0f2546] hover:text-[#64ffda]">
                      01.
                      <Link href="/" className="p-4 text-sm font-semibold text-gray-400">
                        <span className="text-white">Home</span>
                      </Link>{' '}
                    </li>
                    <li className="animate__animated animate__fadeInDownBig mb-1 rounded hover:bg-[#0f2546] hover:text-[#64ffda]">
                      02.
                      <Link href="/blogs" className="p-4 text-sm font-semibold text-gray-400">
                        <span className="text-white">Blogs</span>
                      </Link>{' '}
                    </li>
                    <li className="animate__animated animate__fadeInDownBig mb-1 rounded hover:bg-[#0f2546] hover:text-[#64ffda]">
                      03.
                      <Link href={'/signin'} className="p-4 text-sm font-semibold text-gray-400">
                        <span className="text-white">Sign In</span>
                      </Link>{' '}
                    </li>
                  </ul>
                  <div className="animate__animated animate__fadeInUpBig mt-8 block h-fit rounded-md border-2 border-[#64ffda] p-4 text-center text-[#64ffda]">
                    <a href="Nikola_Stankovic_Resume.pdf" download="NikolaStankovicResume">
                      Resume
                    </a>
                  </div>
                </div>
                <div className="mt-auto">
                  <p className="my-4 text-center text-xs text-gray-400">
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
