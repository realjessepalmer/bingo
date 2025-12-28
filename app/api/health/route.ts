import { NextResponse } from 'next/server';

export async function GET() {
  const kvConfigured = !!(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);
  
  return NextResponse.json({
    status: kvConfigured ? 'ok' : 'error',
    kvConfigured,
    hasKvUrl: !!process.env.KV_REST_API_URL,
    hasKvToken: !!process.env.KV_REST_API_TOKEN,
    message: kvConfigured 
      ? 'KV is properly configured' 
      : 'KV environment variables are missing. Please set KV_REST_API_URL and KV_REST_API_TOKEN in your Vercel project settings.',
  });
}

