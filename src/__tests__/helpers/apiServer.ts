/**
 * Runs a Next.js Pages Router API handler on a real local HTTP server for integration tests.
 * Minimal adapter over node:http: adds `req.body` (JSON-parsed), `res.status`, `res.json`.
 */
import http from 'node:http';
import type { AddressInfo } from 'node:net';
import type { NextApiHandler, NextApiRequest, NextApiResponse } from 'next';

export type TestApiServer = { baseUrl: string; close: () => Promise<void> };

export async function startApiServer(handler: NextApiHandler): Promise<TestApiServer> {
  const server = http.createServer(async (req, res) => {
    const chunks: Buffer[] = [];
    for await (const chunk of req) chunks.push(chunk as Buffer);
    const raw = Buffer.concat(chunks).toString('utf8');
    let body: unknown = raw;
    try {
      body = raw ? JSON.parse(raw) : undefined;
    } catch {
      /* leave as string, like Next does for non-JSON bodies */
    }
    const apiReq = Object.assign(req, { body, query: {}, cookies: {} }) as NextApiRequest;
    const apiRes = Object.assign(res, {
      status(code: number) {
        res.statusCode = code;
        return apiRes;
      },
      json(data: unknown) {
        res.setHeader('content-type', 'application/json');
        res.end(JSON.stringify(data));
        return apiRes;
      },
    }) as unknown as NextApiResponse;
    await handler(apiReq, apiRes);
  });

  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));

  return {
    baseUrl: `http://127.0.0.1:${(server.address() as AddressInfo).port}`,
    close: async () => {
      server.closeAllConnections();
      await new Promise<void>((resolve) => server.close(() => resolve()));
    },
  };
}
