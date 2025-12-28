import { kv } from '@vercel/kv';

export { kv };

// Helper functions for data access
export async function getCardState(theatreId: string): Promise<number[]> {
  const key = `card:${theatreId}`;
  const state = await kv.get<number[]>(key);
  return state || [];
}

export async function setCardState(theatreId: string, markedItems: number[]): Promise<void> {
  const key = `card:${theatreId}`;
  await kv.set(key, markedItems);
}

export async function getComments(theatreId: string): Promise<Record<string, string>> {
  const key = `comments:${theatreId}`;
  const comments = await kv.get<Record<string, string>>(key);
  return comments || {};
}

export async function setComments(theatreId: string, comments: Record<string, string>): Promise<void> {
  const key = `comments:${theatreId}`;
  await kv.set(key, comments);
}

export async function getMiddleSquare(theatreId: string): Promise<string> {
  const key = `middleSquare:${theatreId}`;
  const text = await kv.get<string>(key);
  return text || 'FREE';
}

export async function setMiddleSquare(theatreId: string, text: string): Promise<void> {
  const key = `middleSquare:${theatreId}`;
  await kv.set(key, text);
}

export async function getConfirmedBingos(theatreId: string): Promise<Array<{type: 'row' | 'col' | 'diag', index: number, items: number[], timestamp: string}>> {
  const key = `confirmedBingos:${theatreId}`;
  const bingos = await kv.get<Array<{type: 'row' | 'col' | 'diag', index: number, items: number[], timestamp: string}>>(key);
  return bingos || [];
}

export async function setConfirmedBingos(theatreId: string, bingos: Array<{type: 'row' | 'col' | 'diag', index: number, items: number[], timestamp: string}>): Promise<void> {
  const key = `confirmedBingos:${theatreId}`;
  await kv.set(key, bingos);
}

export async function getLock(theatreId: string): Promise<{sessionId: string, timestamp: number} | null> {
  const key = `lock:${theatreId}`;
  const lock = await kv.get<{sessionId: string, timestamp: number}>(key);
  return lock;
}

export async function setLock(theatreId: string, sessionId: string, timestamp: number): Promise<void> {
  const key = `lock:${theatreId}`;
  await kv.set(key, { sessionId, timestamp });
}

export async function deleteLock(theatreId: string): Promise<void> {
  const key = `lock:${theatreId}`;
  await kv.del(key);
}

export async function getFirstBingo(theatreId: string): Promise<string | null> {
  const key = `firstBingo:${theatreId}`;
  const timestamp = await kv.get<string>(key);
  return timestamp;
}

export async function setFirstBingo(theatreId: string, timestamp: string): Promise<void> {
  const key = `firstBingo:${theatreId}`;
  await kv.set(key, timestamp);
}

export async function getBingoCount(theatreId: string): Promise<number> {
  const key = `bingoCount:${theatreId}`;
  const count = await kv.get<number>(key);
  return count || 0;
}

export async function incrementBingoCount(theatreId: string): Promise<number> {
  const key = `bingoCount:${theatreId}`;
  const count = await kv.get<number>(key) || 0;
  const newCount = count + 1;
  await kv.set(key, newCount);
  return newCount;
}

export async function getMarkedCount(theatreId: string): Promise<number> {
  const key = `markedCount:${theatreId}`;
  const count = await kv.get<number>(key);
  return count || 0;
}

export async function setMarkedCount(theatreId: string, count: number): Promise<void> {
  const key = `markedCount:${theatreId}`;
  await kv.set(key, count);
}

