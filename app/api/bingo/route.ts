import { NextRequest, NextResponse } from 'next/server';
import { getConfirmedBingos, setConfirmedBingos, getFirstBingo, setFirstBingo, incrementBingoCount } from '@/lib/kv';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { theatreId, bingoLine } = body;

    if (!theatreId || !bingoLine) {
      return NextResponse.json({ error: 'theatreId and bingoLine are required' }, { status: 400 });
    }

    const { type, index, items } = bingoLine;
    if (!type || index === undefined || !Array.isArray(items)) {
      return NextResponse.json({ error: 'Invalid bingoLine format' }, { status: 400 });
    }

    const confirmedBingos = await getConfirmedBingos(theatreId);
    
    // Check if this bingo line is already confirmed
    const alreadyConfirmed = confirmedBingos.some(
      (b) => b.type === type && b.index === index
    );

    if (alreadyConfirmed) {
      return NextResponse.json({ error: 'Bingo line already confirmed' }, { status: 400 });
    }

    // Add the new bingo
    const timestamp = new Date().toISOString();
    confirmedBingos.push({ type, index, items, timestamp });
    await setConfirmedBingos(theatreId, confirmedBingos);

    // Check if this is the first bingo
    const firstBingo = await getFirstBingo(theatreId);
    if (!firstBingo) {
      await setFirstBingo(theatreId, timestamp);
    }

    // Increment bingo count
    const newCount = await incrementBingoCount(theatreId);

    return NextResponse.json({ 
      success: true, 
      isFirstBingo: !firstBingo,
      bingoCount: newCount,
    });
  } catch (error) {
    console.error('Error confirming bingo:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const theatreId = searchParams.get('theatreId');

    if (!theatreId) {
      return NextResponse.json({ error: 'theatreId is required' }, { status: 400 });
    }

    const confirmedBingos = await getConfirmedBingos(theatreId);
    return NextResponse.json({ confirmedBingos });
  } catch (error) {
    console.error('Error getting confirmed bingos:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

