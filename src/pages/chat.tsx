import SEO from '@/components/layout/seo/SEO';
import ModelChat from '@/components/layout/modelChat';

export default function ChatPage() {
  return (
    <>
      <SEO
        title="AI Chat - Nicode"
        description="Chat with Nicode AI, powered by Gemini 3.5 Flash-Lite."
        url="https://www.nicode.ai/chat"
      />
      <ModelChat />
    </>
  );
}
