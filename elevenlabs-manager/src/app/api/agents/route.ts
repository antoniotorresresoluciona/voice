import { NextResponse } from 'next/server';

function getApiKey(request: Request): string | null {
    return request.headers.get('X-Api-Key') || process.env.ELEVENLABS_API_KEY || null;
}

export async function GET(request: Request) {
  const apiKey = getApiKey(request);

  if (!apiKey) {
    return NextResponse.json({ error: 'ElevenLabs API key not found' }, { status: 500 });
  }

  try {
    const response = await fetch('https://api.elevenlabs.io/v1/convai/agents', {
      headers: {
        'xi-api-key': apiKey,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json({ error: 'Failed to fetch agents from ElevenLabs', details: errorData }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const apiKey = getApiKey(request);

  if (!apiKey) {
    return NextResponse.json({ error: 'ElevenLabs API key not found' }, { status: 500 });
  }

  try {
    const body = await request.json();
    const response = await fetch('https://api.elevenlabs.io/v1/convai/agents', {
      method: 'POST',
      headers: {
        'xi-api-key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json({ error: 'Failed to create agent in ElevenLabs', details: errorData }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}