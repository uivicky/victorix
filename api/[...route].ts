import type { IncomingMessage, ServerResponse } from 'http';
import app from '../server.ts';

export default function handler(req: IncomingMessage, res: ServerResponse) {
  const rawUrl = req.url || '/';
  const qIdx = rawUrl.indexOf('?');

  if (qIdx !== -1) {
    const params = new URLSearchParams(rawUrl.slice(qIdx + 1));
    const forwardedPath = params.get('__vercel_path');
    if (forwardedPath) {
      params.delete('__vercel_path');
      const remainingQs = params.toString();
      req.url = remainingQs ? `${forwardedPath}?${remainingQs}` : forwardedPath;
    }
  }

  return app(req as any, res as any);
}
