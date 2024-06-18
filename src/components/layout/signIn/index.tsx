import { FC } from "react";

export const SignIn: FC = () => {
  return (
    <div className="w-full bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-md xl:p-0 dark:bg-gray-800 dark:border-gray-700">
      <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
        <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white">
          Sign in to your account
        </h1>
        <form>
          Name:
          <input type="email" placeholder="email"></input>
          Password:
          <input type="password" placeholder="password"></input>
          <button type="submit"></button>
          <input type="checkbox"></input>
          <p>Forgot Password?</p>
        </form>
      </div>
      <p>Do not have an account yet? Sign Up!</p>
    </div>
  );
};
