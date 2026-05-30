export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

export interface NewsArticle {
  title: string;
  description: string | null;
  link: string;
  pubDate: string | null;
  image_url: string | null;
  source_id: string;
  category: string[] | null;
}

interface NewsDataResponse {
  status: string;
  totalResults: number;
  results: NewsArticle[];
  nextPage?: string;
}

export async function fetchAINews(): Promise<NewsArticle[]> {
  const apiKey = process.env.NEWSDATA_API_KEY;

  if (!apiKey) {
    console.error('NEWSDATA_API_KEY is not defined');
    return [];
  }

  try {
    const res = await fetch(
      `https://newsdata.io/api/1/news?apikey=${apiKey}&q=artificial+intelligence&language=en&category=technology`,
    );

    if (!res.ok) {
      console.error(`NewsData API error: ${res.status} ${res.statusText}`);
      return [];
    }

    const data: NewsDataResponse = await res.json();

    if (data.status !== 'success') {
      console.error('NewsData API returned non-success status:', data.status);
      return [];
    }

    return data.results;
  } catch (error) {
    error instanceof Error && console.error('Failed to fetch AI news:', error);
    return [];
  }
}
