import SEO from '@/components/layout/seo/SEO';
import ModelChat from '@/components/layout/modelChat';

export default function ChatPage() {
  return (
    <>
      <SEO
        title="AI Chat - Nicode"
        description="Chat with leading AI models in one place."
        url="https://www.nicode.ai/chat"
      />
      <ModelChat />
    </>
  );
}
