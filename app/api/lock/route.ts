import { NextRequest, NextResponse } from 'next/server';
import { getLock, setLock, deleteLock } from '@/lib/kv';
import { LOCK_TIMEOUT_MS } from '@/lib/config';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const theatreId = searchParams.get('theatreId');

    if (!theatreId) {
      return NextResponse.json({ error: 'theatreId is required' }, { status: 400 });
    }

    const lock = await getLock(theatreId);
    
    if (!lock) {
      return NextResponse.json({ locked: false });
    }

    const now = Date.now();
    const lockAge = now - lock.timestamp;
    const isExpired = lockAge >= LOCK_TIMEOUT_MS;

    if (isExpired) {
      await deleteLock(theatreId);
      return NextResponse.json({ locked: false });
    }

    return NextResponse.json({ 
      locked: true, 
      sessionId: lock.sessionId,
      timestamp: lock.timestamp,
      remainingMs: LOCK_TIMEOUT_MS - lockAge,
    });
  } catch (error) {
    console.error('Error getting lock:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { theatreId, sessionId } = body;

    if (!theatreId || !sessionId) {
      return NextResponse.json({ error: 'theatreId and sessionId are required' }, { status: 400 });
    }

    const existingLock = await getLock(theatreId);
    const now = Date.now();

    if (existingLock) {
      const lockAge = now - existingLock.timestamp;
      const isExpired = lockAge >= LOCK_TIMEOUT_MS;

      if (!isExpired && existingLock.sessionId !== sessionId) {
        return NextResponse.json({ 
          error: 'Theatre is locked by another session',
          locked: true,
          remainingMs: LOCK_TIMEOUT_MS - lockAge,
        }, { status: 409 });
      }
    }

    await setLock(theatreId, sessionId, now);
    return NextResponse.json({ success: true, timestamp: now });
  } catch (error) {
    console.error('Error setting lock:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const theatreId = searchParams.get('theatreId');
    const sessionId = searchParams.get('sessionId');

    if (!theatreId) {
      return NextResponse.json({ error: 'theatreId is required' }, { status: 400 });
    }

    const lock = await getLock(theatreId);
    
    if (lock && sessionId && lock.sessionId !== sessionId) {
      return NextResponse.json({ error: 'Cannot release lock owned by another session' }, { status: 403 });
    }

    await deleteLock(theatreId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting lock:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

