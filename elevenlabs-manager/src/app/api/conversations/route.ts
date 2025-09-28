import { NextResponse } from 'next/server';

function getApiKey(request: Request): string | null {
    return request.headers.get('X-Api-Key') || process.env.ELEVENLABS_API_KEY || null;
}

// GET all conversations
export async function GET(request: Request) {
  const apiKey = getApiKey(request);

  if (!apiKey) {
    return NextResponse.json({ error: 'ElevenLabs API key not found' }, { status: 500 });
  }

  try {
    const response = await fetch('https://api.elevenlabs.io/v1/convai/conversations', {
      headers: { 'xi-api-key': apiKey },
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json({ error: 'Failed to fetch conversations', details: errorData }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}