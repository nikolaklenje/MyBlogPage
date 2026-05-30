import { GetServerSideProps } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import SEO from '@/components/layout/seo/SEO';
import { fetchAINews, NewsArticle, generateSlug } from '@/library/news';

export const getServerSideProps: GetServerSideProps = async () => {
  const articles = await fetchAINews();
  return {
    props: {
      articles,
    },
  };
};

export default function AINewsPage({ articles }: { articles: NewsArticle[] }) {
  const [imgErrors, setImgErrors] = useState<Record<string, boolean>>({});

  const handleImgError = (key: string) => {
    setImgErrors((prev) => ({ ...prev, [key]: true }));
  };

  return (
    <>
      <SEO
        title="AI News - Nicode"
        description="Stay up to date with the latest artificial intelligence news and technology headlines, curated for you by Nicode."
        url="https://www.nicode.ai/ai-news"
      />
      <div className="w-full max-w-7xl px-8 py-12">
        <h1 className="animate__animated animate__fadeInDown mb-2 text-3xl font-bold text-[#64ffda]">
          AI News
        </h1>
        <p className="animate__animated animate__fadeInDown mb-10 text-gray-400">
          Latest artificial intelligence headlines from around the web.
        </p>

        {articles.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <p className="text-xl font-semibold text-gray-400">No articles available right now.</p>
            <p className="mt-2 text-sm text-gray-500">Please check back later.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {articles.map((article, index) => {
              const imgKey = `${article.source_id}-${index}`;
              const showFallback = !article.image_url || imgErrors[imgKey];

              return (
                <Link
                  key={imgKey}
                  href={`/ai-news/${generateSlug(article.title)}`}
                  className="animate__animated animate__fadeInUp flex cursor-pointer flex-col rounded-lg border border-gray-700 bg-gray-800 shadow transition-shadow duration-300 hover:shadow-[0_0_16px_#64ffda33]"
                >
                  <div className="relative h-48 w-full overflow-hidden rounded-t-lg bg-gray-700">
                    {showFallback ? (
                      <Image src="/nicode-ai-logo-og.png" alt="Nicode placeholder" fill />
                    ) : (
                      <Image
                        src={article.image_url!}
                        alt={article.title}
                        fill
                        className="object-cover"
                        unoptimized
                        onError={() => handleImgError(imgKey)}
                      />
                    )}
                  </div>

                  <div className="flex flex-1 flex-col p-5">
                    <div className="mb-3 flex items-center justify-between text-xs text-gray-500">
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

                    <h2 className="mb-2 text-lg leading-snug font-bold tracking-tight text-white">
                      {article.title}
                    </h2>

                    {article.description && (
                      <p className="mb-4 line-clamp-3 flex-1 text-sm font-normal text-gray-400">
                        {article.description}
                      </p>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
