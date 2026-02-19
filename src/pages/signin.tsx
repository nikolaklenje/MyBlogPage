import SEO from '@/components/layout/seo/SEO';
import { SignIn } from '@/components/layout';

export default function SignInPage() {
  return (
    <>
      <SEO
        title="Sign In - Nicode"
        description="Sign in to your Nicode account to access exclusive content and features."
        url="https://www.nicode.io/signin"
      />
      <SignIn />
    </>
  );
}
