import { NextResponse } from 'next/server';
import { kv } from '@/lib/kv';

export async function GET() {
  try {
    // Test write
    await kv.set('test:key', { test: 'value', timestamp: Date.now() });
    
    // Test read
    const value = await kv.get('test:key');
    
    // Test delete
    await kv.del('test:key');
    
    return NextResponse.json({
      success: true,
      message: 'KV read/write/delete operations successful',
      testValue: value,
    });
  } catch (error) {
    console.error('KV test error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : undefined;
    
    return NextResponse.json({
      success: false,
      error: errorMessage,
      stack: process.env.NODE_ENV === 'development' ? errorStack : undefined,
      kvUrl: process.env.KV_REST_API_URL ? 'Set' : 'Not set',
      kvToken: process.env.KV_REST_API_TOKEN ? 'Set' : 'Not set',
    }, { status: 500 });
  }
}

