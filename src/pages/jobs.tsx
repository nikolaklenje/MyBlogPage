import fs from 'fs';
import path from 'path';
import { useMemo, useState } from 'react';
import type { GetStaticProps } from 'next';
import SEO from '@/components/layout/seo/SEO';

type Job = {
  id: string;
  title: string;
  company: string;
  location: string;
  url: string;
  posted: string;
  ageDays: number | null;
  remote: 'yes' | 'maybe';
  isNew: boolean;
};

type JobsFile = { generatedAt: string; count: number; jobs: Job[] };
type Props = { jobs: Job[]; generatedAt: string };

// Board tokens are lowercase slugs; a few need help to read nicely.
const COMPANY_NAMES: Record<string, string> = {
  temporaltechnologies: 'Temporal',
  grafanalabs: 'Grafana Labs',
  cockroachlabs: 'Cockroach Labs',
  oysterhr: 'Oyster',
  clickhouse: 'ClickHouse',
  mongodb: 'MongoDB',
  gitlab: 'GitLab',
  hubspot: 'HubSpot',
  openai: 'OpenAI',
  '1password': '1Password',
};

function companyLabel(token: string) {
  return COMPANY_NAMES[token] ?? token.charAt(0).toUpperCase() + token.slice(1);
}

export default function JobsPage({ jobs, generatedAt }: Props) {
  const [company, setCompany] = useState('all');
  const [includeUnclear, setIncludeUnclear] = useState(false);

  const companies = useMemo(() => Array.from(new Set(jobs.map((j) => j.company))).sort(), [jobs]);

  const visible = useMemo(
    () =>
      jobs.filter((j) => {
        if (!includeUnclear && j.remote === 'maybe') return false;
        if (company !== 'all' && j.company !== company) return false;
        return true;
      }),
    [jobs, company, includeUnclear],
  );

  const unclearCount = jobs.filter((j) => j.remote === 'maybe').length;

  return (
    <>
      <SEO
        title="Jobs - Nicode"
        description="Remote US software engineering roles, pulled daily from company job boards and filtered for signal."
        url="https://www.nicode.ai/jobs"
      />
      <div className="w-full max-w-7xl px-8 py-12">
        <h1 className="animate__animated animate__fadeInDown mb-2 text-3xl font-bold text-[#64ffda]">
          Jobs
        </h1>
        <p className="animate__animated animate__fadeInDown mb-8 text-gray-400">
          Remote US engineering roles, pulled straight from company job boards · updated{' '}
          {new Date(generatedAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          })}
        </p>

        <div className="mb-10 flex flex-wrap items-center gap-4">
          <select
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            className="rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-gray-300 focus:border-[#64ffda] focus:outline-none"
          >
            <option value="all">All companies ({jobs.length})</option>
            {companies.map((c) => (
              <option key={c} value={c}>
                {companyLabel(c)}
              </option>
            ))}
          </select>

          <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-400">
            <input
              type="checkbox"
              checked={includeUnclear}
              onChange={(e) => setIncludeUnclear(e.target.checked)}
              className="accent-[#64ffda]"
            />
            Include {unclearCount} with unclear location
          </label>

          <span className="ml-auto text-sm text-gray-500">{visible.length} shown</span>
        </div>

        {visible.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <p className="text-xl font-semibold text-gray-400">No roles match.</p>
            <p className="mt-2 text-sm text-gray-500">Try clearing the company filter.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {visible.map((job) => (
              <a
                key={job.id}
                href={job.url}
                target="_blank"
                rel="noopener noreferrer"
                className="animate__animated animate__fadeInUp flex cursor-pointer flex-col rounded-lg border border-gray-700 bg-gray-800 p-5 shadow transition-shadow duration-300 hover:shadow-[0_0_16px_#64ffda33]"
              >
                <div className="mb-3 flex items-center justify-between gap-2 text-xs text-gray-500">
                  <span className="rounded bg-gray-700 px-2 py-1 font-medium tracking-wide text-[#64ffda] uppercase">
                    {companyLabel(job.company)}
                  </span>
                  <div className="flex shrink-0 items-center gap-2">
                    {job.isNew && (
                      <span className="rounded bg-[#64ffda] px-2 py-1 font-bold tracking-wide text-gray-900 uppercase">
                        New
                      </span>
                    )}
                    {job.ageDays !== null && <span>{job.ageDays}d ago</span>}
                  </div>
                </div>

                <h2 className="mb-2 flex-1 text-lg leading-snug font-bold tracking-tight text-white">
                  {job.title}
                </h2>

                <p className="text-sm font-normal text-gray-400">
                  {job.location}
                  {job.remote === 'maybe' && (
                    <span className="ml-2 text-amber-500/80">· verify location</span>
                  )}
                </p>
              </a>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

export const getStaticProps: GetStaticProps<Props> = async () => {
  const file = path.join(process.cwd(), 'src', 'data', 'jobs.json');
  const data: JobsFile = JSON.parse(fs.readFileSync(file, 'utf8'));

  return {
    props: { jobs: data.jobs, generatedAt: data.generatedAt },
    revalidate: 3600,
  };
};
