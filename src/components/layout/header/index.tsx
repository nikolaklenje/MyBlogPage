import { FC, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { User } from '@supabase/supabase-js';
import { signOut } from '@/library/auth';
import { MobileMenu } from './mobileMenu';

export interface HeaderProps {
  user: User | null;
}

export const Header: FC<HeaderProps> = ({ user }) => {
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
                  <title>Header</title>
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
                </Link>
              </li>
              <li className="animate__animated animate__fadeInDownBig hover:text-[#64ffda]">
                03.{' '}
                <span
                  className="text-md cursor-not-allowed p-4 font-semibold text-gray-400 opacity-40"
                  title="Coming Soon"
                >
                  AI Hub
                </span>
              </li>
            </span>
          </ul>
          <div className="animate__animated animate__fadeInUpBig mt-0 ml-4 block hidden h-fit rounded-md border-2 border-[#64ffda] p-4 text-[#64ffda] lg:flex">
            {user ? (
              <button
                onClick={async (e) => {
                  e.preventDefault();
                  try {
                    await signOut(router);
                  } catch (error) {
                    error instanceof Error && console.error(error);
                  }
                }}
              >
                <span className="text-white hover:text-[#64ffda]">Sign Out</span>
              </button>
            ) : (
              <Link href={'/signin'}>
                <span className="text-white hover:text-[#64ffda]">Sign In</span>
              </Link>
            )}
          </div>
          {isOpen ? <MobileMenu user={user} router={router} toggleMenu={toggleMenu} /> : null}
        </div>
      </div>
    </div>
  );
};
