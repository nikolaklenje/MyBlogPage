import { FC } from 'react';
import Link from 'next/link';
import { signOut } from '@/library/auth';
import { MouseEventHandler } from 'react';
import { NextRouter } from 'next/router';
import { HeaderProps } from '.';

interface MobileMenu extends HeaderProps {
  router: NextRouter;
  toggleMenu: MouseEventHandler<HTMLButtonElement> | undefined;
}
export const MobileMenu: FC<MobileMenu> = ({ toggleMenu, router, user }) => {
  return (
    <div className="relative z-50 flex">
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
              <path stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        <div>
          <ul>
            <li className="animate__animated animate__fadeInDownBig mb-1 rounded hover:bg-[#0f2546] hover:text-[#64ffda]">
              01.
              <Link href="/" className="text-md p-4 font-semibold text-gray-400">
                <span className="text-white">Home</span>
              </Link>{' '}
            </li>
            <li className="animate__animated animate__fadeInDownBig mb-1 rounded hover:bg-[#0f2546] hover:text-[#64ffda]">
              02.
              <Link href="/blogs" className="text-md p-4 font-semibold text-gray-400">
                <span className="text-white">Blogs</span>
              </Link>{' '}
            </li>
            <li className="animate__animated animate__fadeInDownBig mb-1 rounded hover:bg-[#0f2546] hover:text-[#64ffda]">
              03.
              <Link href="/ai-news" className="text-md p-4 font-semibold text-gray-400">
                <span className="text-white">AI News</span>
              </Link>{' '}
            </li>
          </ul>
          <div className="animate__animated animate__fadeInUpBig mt-8 block h-fit rounded-md border-2 border-[#64ffda] p-4 text-center text-[#64ffda]">
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
        </div>
        <div className="mt-auto">
          <p className="my-4 text-center text-xs text-gray-400">
            <span>Copyright © 2026</span>
          </p>
        </div>
      </nav>
    </div>
  );
};
