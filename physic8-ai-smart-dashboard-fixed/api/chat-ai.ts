import { chatWithAI, readJsonBody } from '../serverless/aiShared';

export default async function handler(req: any, res: any) {
  res.setHeader?.('Content-Type', 'application/json; charset=utf-8');
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }
  const body = await readJsonBody(req);
  const result = await chatWithAI(body);
  return res.status(result.status).json(result.body);
}
