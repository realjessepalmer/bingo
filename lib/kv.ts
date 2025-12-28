import { kv } from '@vercel/kv';

export { kv };

// Check if KV is configured
function isKVConfigured(): boolean {
  return !!(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);
}

// Helper functions for data access
export async function getCardState(theatreId: string): Promise<number[]> {
  if (!isKVConfigured()) {
    throw new Error('KV_REST_API_URL and KV_REST_API_TOKEN environment variables are not set. Please configure your KV database in Vercel project settings.');
  }
  try {
    const key = `card:${theatreId}`;
    const state = await kv.get<number[]>(key);
    return state || [];
  } catch (error) {
    console.error('Error getting card state:', error);
    throw error;
  }
}

export async function setCardState(theatreId: string, markedItems: number[]): Promise<void> {
  if (!isKVConfigured()) {
    throw new Error('KV_REST_API_URL and KV_REST_API_TOKEN environment variables are not set. Please configure your KV database in Vercel project settings.');
  }
  const key = `card:${theatreId}`;
  await kv.set(key, markedItems);
}

export async function getComments(theatreId: string): Promise<Record<string, string>> {
  if (!isKVConfigured()) {
    throw new Error('KV_REST_API_URL and KV_REST_API_TOKEN environment variables are not set. Please configure your KV database in Vercel project settings.');
  }
  const key = `comments:${theatreId}`;
  const comments = await kv.get<Record<string, string>>(key);
  return comments || {};
}

export async function setComments(theatreId: string, comments: Record<string, string>): Promise<void> {
  if (!isKVConfigured()) {
    throw new Error('KV_REST_API_URL and KV_REST_API_TOKEN environment variables are not set. Please configure your KV database in Vercel project settings.');
  }
  const key = `comments:${theatreId}`;
  await kv.set(key, comments);
}

export async function getMiddleSquare(theatreId: string): Promise<string> {
  if (!isKVConfigured()) {
    throw new Error('KV_REST_API_URL and KV_REST_API_TOKEN environment variables are not set. Please configure your KV database in Vercel project settings.');
  }
  const key = `middleSquare:${theatreId}`;
  const text = await kv.get<string>(key);
  return text || 'FREE';
}

export async function setMiddleSquare(theatreId: string, text: string): Promise<void> {
  if (!isKVConfigured()) {
    throw new Error('KV_REST_API_URL and KV_REST_API_TOKEN environment variables are not set. Please configure your KV database in Vercel project settings.');
  }
  const key = `middleSquare:${theatreId}`;
  await kv.set(key, text);
}

export async function getConfirmedBingos(theatreId: string): Promise<Array<{type: 'row' | 'col' | 'diag', index: number, items: number[], timestamp: string}>> {
  if (!isKVConfigured()) {
    throw new Error('KV_REST_API_URL and KV_REST_API_TOKEN environment variables are not set. Please configure your KV database in Vercel project settings.');
  }
  const key = `confirmedBingos:${theatreId}`;
  const bingos = await kv.get<Array<{type: 'row' | 'col' | 'diag', index: number, items: number[], timestamp: string}>>(key);
  return bingos || [];
}

export async function setConfirmedBingos(theatreId: string, bingos: Array<{type: 'row' | 'col' | 'diag', index: number, items: number[], timestamp: string}>): Promise<void> {
  if (!isKVConfigured()) {
    throw new Error('KV_REST_API_URL and KV_REST_API_TOKEN environment variables are not set. Please configure your KV database in Vercel project settings.');
  }
  const key = `confirmedBingos:${theatreId}`;
  await kv.set(key, bingos);
}

export async function getLock(theatreId: string): Promise<{sessionId: string, timestamp: number} | null> {
  if (!isKVConfigured()) {
    throw new Error('KV_REST_API_URL and KV_REST_API_TOKEN environment variables are not set. Please configure your KV database in Vercel project settings.');
  }
  const key = `lock:${theatreId}`;
  const lock = await kv.get<{sessionId: string, timestamp: number}>(key);
  return lock;
}

export async function setLock(theatreId: string, sessionId: string, timestamp: number): Promise<void> {
  if (!isKVConfigured()) {
    throw new Error('KV_REST_API_URL and KV_REST_API_TOKEN environment variables are not set. Please configure your KV database in Vercel project settings.');
  }
  const key = `lock:${theatreId}`;
  await kv.set(key, { sessionId, timestamp });
}

export async function deleteLock(theatreId: string): Promise<void> {
  if (!isKVConfigured()) {
    throw new Error('KV_REST_API_URL and KV_REST_API_TOKEN environment variables are not set. Please configure your KV database in Vercel project settings.');
  }
  const key = `lock:${theatreId}`;
  await kv.del(key);
}

export async function getFirstBingo(theatreId: string): Promise<string | null> {
  if (!isKVConfigured()) {
    throw new Error('KV_REST_API_URL and KV_REST_API_TOKEN environment variables are not set. Please configure your KV database in Vercel project settings.');
  }
  const key = `firstBingo:${theatreId}`;
  const timestamp = await kv.get<string>(key);
  return timestamp;
}

export async function setFirstBingo(theatreId: string, timestamp: string): Promise<void> {
  if (!isKVConfigured()) {
    throw new Error('KV_REST_API_URL and KV_REST_API_TOKEN environment variables are not set. Please configure your KV database in Vercel project settings.');
  }
  const key = `firstBingo:${theatreId}`;
  await kv.set(key, timestamp);
}

export async function getBingoCount(theatreId: string): Promise<number> {
  if (!isKVConfigured()) {
    throw new Error('KV_REST_API_URL and KV_REST_API_TOKEN environment variables are not set. Please configure your KV database in Vercel project settings.');
  }
  const key = `bingoCount:${theatreId}`;
  const count = await kv.get<number>(key);
  return count || 0;
}

export async function incrementBingoCount(theatreId: string): Promise<number> {
  if (!isKVConfigured()) {
    throw new Error('KV_REST_API_URL and KV_REST_API_TOKEN environment variables are not set. Please configure your KV database in Vercel project settings.');
  }
  const key = `bingoCount:${theatreId}`;
  const count = await kv.get<number>(key) || 0;
  const newCount = count + 1;
  await kv.set(key, newCount);
  return newCount;
}

export async function getMarkedCount(theatreId: string): Promise<number> {
  if (!isKVConfigured()) {
    throw new Error('KV_REST_API_URL and KV_REST_API_TOKEN environment variables are not set. Please configure your KV database in Vercel project settings.');
  }
  const key = `markedCount:${theatreId}`;
  const count = await kv.get<number>(key);
  return count || 0;
}

export async function setMarkedCount(theatreId: string, count: number): Promise<void> {
  if (!isKVConfigured()) {
    throw new Error('KV_REST_API_URL and KV_REST_API_TOKEN environment variables are not set. Please configure your KV database in Vercel project settings.');
  }
  const key = `markedCount:${theatreId}`;
  await kv.set(key, count);
}

