import { NextRequest, NextResponse } from 'next/server';
import { getCardState, setCardState, setMarkedCount } from '@/lib/kv';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const theatreId = searchParams.get('theatreId');

    if (!theatreId) {
      return NextResponse.json({ error: 'theatreId is required' }, { status: 400 });
    }

    const markedItems = await getCardState(theatreId);
    return NextResponse.json({ markedItems });
  } catch (error) {
    console.error('Error getting card state:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    const errorStack = error instanceof Error ? error.stack : undefined;
    return NextResponse.json({ 
      error: errorMessage,
      stack: process.env.NODE_ENV === 'development' ? errorStack : undefined,
      details: 'Error accessing KV database'
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { theatreId, markedItems } = body;

    if (!theatreId || !Array.isArray(markedItems)) {
      return NextResponse.json({ error: 'theatreId and markedItems array are required' }, { status: 400 });
    }

    await setCardState(theatreId, markedItems);
    await setMarkedCount(theatreId, markedItems.length);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error setting card state:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ 
      error: errorMessage,
      details: 'Error writing to KV database'
    }, { status: 500 });
  }
}

