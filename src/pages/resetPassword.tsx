import { supabase } from '@/library/supabaseApi';
import { useState } from 'react';

export default function resetPassword() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const sendNewPassword = async () => {
    if (newPassword === confirmNewPassword) {
      try {
        const setupPassword = await supabase.auth.updateUser({
          password: newPassword,
        });
        const { error } = setupPassword;
        if (error) {
          setErrorMessage(error.message);
        }
      } catch (error) {
        console.log(error);
      }
    } else {
      setErrorMessage('Password not matching');
    }
  };

  return (
    <div className="mt-48 flex flex-col items-center">
      <h1 className="text-6xl font-semibold text-white">Reset Password</h1>
      <div className="mx-auto my-20 md:px-6">
        <section className="mb-32 text-center">
          <div className="flex flex-wrap justify-center">
            <form className="w-full shrink-0 grow-0 basis-auto" method="post">
              <div className="relative mb-3">
                <input
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                  }}
                  type="password"
                  className="block min-h-[auto] w-full rounded border-2 border-[#64ffda] bg-transparent px-3 py-[0.32rem] leading-[1.6] text-white transition-all duration-200 ease-linear outline-none focus:placeholder:opacity-100 data-[te-input-state-active]:placeholder:opacity-100 motion-reduce:transition-none dark:text-neutral-200"
                  placeholder="New password"
                  name="password"
                />
              </div>
              <div className="relative mb-3">
                <input
                  onChange={(e) => {
                    setConfirmNewPassword(e.target.value);
                  }}
                  type="password"
                  className="block min-h-[auto] w-full rounded border-2 border-[#64ffda] bg-transparent px-3 py-[0.32rem] leading-[1.6] text-white transition-all duration-200 ease-linear outline-none focus:placeholder:opacity-100 data-[te-input-state-active]:placeholder:opacity-100 motion-reduce:transition-none dark:text-neutral-200"
                  placeholder="Confirm password"
                  name="password"
                />
              </div>
              <p className="text-red-600">{errorMessage}</p>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  sendNewPassword();
                }}
                type="submit"
                defaultValue="Reset Password"
                className="bg-primary hover:bg-primary-600 focus:bg-primary-600 active:bg-primary-700 inline-block w-full rounded border-[#64ffda] px-6 pt-2.5 pb-2 text-xs leading-normal font-medium text-[#64ffda] uppercase shadow-[0_4px_9px_-4px_#64ffda] transition duration-150 ease-in-out hover:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:ring-0 focus:outline-none active:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)]"
              >
                Update Password
              </button>
            </form>
          </div>
        </section>
      </div>
    </div>
  );
}
