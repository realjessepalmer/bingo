import { NextResponse } from 'next/server';
import { THEATRES } from '@/lib/config';

export async function GET() {
  try {
    return NextResponse.json({ theatres: THEATRES });
  } catch (error) {
    console.error('Error getting theatres:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

