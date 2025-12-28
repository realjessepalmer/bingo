import { NextRequest, NextResponse } from 'next/server';
import { getComments, setComments } from '@/lib/kv';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const theatreId = searchParams.get('theatreId');

    if (!theatreId) {
      return NextResponse.json({ error: 'theatreId is required' }, { status: 400 });
    }

    const comments = await getComments(theatreId);
    return NextResponse.json({ comments });
  } catch (error) {
    console.error('Error getting comments:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { theatreId, cellIndex, comment } = body;

    if (!theatreId || cellIndex === undefined) {
      return NextResponse.json({ error: 'theatreId and cellIndex are required' }, { status: 400 });
    }

    const comments = await getComments(theatreId);
    if (comment && comment.trim()) {
      comments[cellIndex.toString()] = comment.trim().substring(0, 200); // Max 200 chars
    } else {
      delete comments[cellIndex.toString()];
    }
    
    await setComments(theatreId, comments);
    return NextResponse.json({ success: true, comments });
  } catch (error) {
    console.error('Error setting comment:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const theatreId = searchParams.get('theatreId');
    const cellIndex = searchParams.get('cellIndex');

    if (!theatreId || !cellIndex) {
      return NextResponse.json({ error: 'theatreId and cellIndex are required' }, { status: 400 });
    }

    const comments = await getComments(theatreId);
    delete comments[cellIndex];
    await setComments(theatreId, comments);
    
    return NextResponse.json({ success: true, comments });
  } catch (error) {
    console.error('Error deleting comment:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

