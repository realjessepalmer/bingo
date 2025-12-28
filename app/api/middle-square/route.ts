import { NextRequest, NextResponse } from 'next/server';
import { getMiddleSquare, setMiddleSquare } from '@/lib/kv';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const theatreId = searchParams.get('theatreId');

    if (!theatreId) {
      return NextResponse.json({ error: 'theatreId is required' }, { status: 400 });
    }

    const text = await getMiddleSquare(theatreId);
    return NextResponse.json({ text });
  } catch (error) {
    console.error('Error getting middle square:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { theatreId, text } = body;

    if (!theatreId) {
      return NextResponse.json({ error: 'theatreId is required' }, { status: 400 });
    }

    const trimmedText = text ? text.trim().substring(0, 50) : 'FREE'; // Max 50 chars
    await setMiddleSquare(theatreId, trimmedText);
    
    return NextResponse.json({ success: true, text: trimmedText });
  } catch (error) {
    console.error('Error setting middle square:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

