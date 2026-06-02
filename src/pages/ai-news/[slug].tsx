import { GetServerSideProps } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import SEO from '@/components/layout/seo/SEO';
import { fetchAINews, NewsArticle, generateSlug } from '@/library/news';

interface Props {
  article: NewsArticle;
}

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  const slug = params?.slug as string;
  const articles = await fetchAINews();
  const article = articles.find((a) => generateSlug(a.title) === slug) ?? null;

  if (!article) {
    return { notFound: true };
  }

  return { props: { article } };
};

export default function AINewsDetailPage({ article }: Props) {
  const [imgError, setImgError] = useState(false);
  const showFallback = !article.image_url || imgError;

  return (
    <>
      <SEO
        title={`${article.title} - Nicode AI News`}
        description={article.description ?? 'Read the latest AI news on Nicode.'}
        url={`https://www.nicode.ai/ai-news/${generateSlug(article.title)}`}
      />
      <div className="w-full max-w-4xl px-8 py-12">
        {/* Back button */}
        <Link
          href="/ai-news"
          className="animate__animated animate__fadeInDown mb-8 inline-flex items-center gap-1 text-sm text-[#64ffda] hover:underline"
        >
          ← Back to AI News
        </Link>

        {/* Hero image */}
        <div className="animate__animated animate__fadeInDown relative mt-6 h-64 w-full overflow-hidden rounded-lg bg-gray-700 sm:h-80">
          {showFallback ? (
            <Image src="/nicode-ai-logo-og.png" alt="Nicode placeholder" fill />
          ) : (
            <Image
              src={article.image_url!}
              alt={article.title}
              fill
              className="object-cover"
              unoptimized
              onError={() => setImgError(true)}
            />
          )}
        </div>

        {/* Meta row */}
        <div className="animate__animated animate__fadeInDown mt-6 flex items-center justify-between text-xs text-gray-500">
          <span className="rounded bg-gray-700 px-2 py-1 font-medium tracking-wide text-[#64ffda] uppercase">
            {article.source_id}
          </span>
          {article.pubDate && (
            <span>
              {new Date(article.pubDate).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })}
            </span>
          )}
        </div>

        {/* Title */}
        <h1 className="animate__animated animate__fadeInDown mt-4 text-2xl leading-snug font-bold tracking-tight text-white sm:text-3xl">
          {article.title}
        </h1>

        {/* Description */}
        {article.description && (
          <p className="animate__animated animate__fadeInDown mt-4 text-base text-gray-400">
            {article.description}
          </p>
        )}

        {/* CTA */}
        <div className="animate__animated animate__fadeInDown mt-8">
          <Link
            href={article.link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center rounded-lg bg-blue-700 px-4 py-2.5 text-center text-sm font-medium text-white hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 focus:outline-none dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
          >
            Read full article →
            <svg
              className="ms-2 h-3.5 w-3.5 rtl:rotate-180"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 14 10"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M1 5h12m0 0L9 1m4 4L9 9"
              />
            </svg>
          </Link>
          <p className="mt-2 text-xs text-gray-500">
            Opens original article on {article.source_id}
          </p>
        </div>
      </div>
    </>
  );
}
