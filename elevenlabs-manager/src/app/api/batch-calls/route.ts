import { NextResponse } from 'next/server';

function getApiKey(request: Request): string | null {
    return request.headers.get('X-Api-Key') || process.env.ELEVENLABS_API_KEY || null;
}

// GET all batch calls
export async function GET(request: Request) {
  const apiKey = getApiKey(request);

  if (!apiKey) {
    return NextResponse.json({ error: 'ElevenLabs API key not found' }, { status: 500 });
  }

  try {
    const response = await fetch('https://api.elevenlabs.io/v1/convai/batch-calling', {
      headers: { 'xi-api-key': apiKey },
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json({ error: 'Failed to fetch batch calls', details: errorData }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error in GET /api/batch-calls:", error);
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}

// CREATE a new batch call
export async function POST(request: Request) {
  const apiKey = getApiKey(request);

  if (!apiKey) {
    return NextResponse.json({ error: 'ElevenLabs API key not found' }, { status: 500 });
  }

  try {
    const body = await request.json();
    const response = await fetch('https://api.elevenlabs.io/v1/convai/batch-calling/create-from-csv', {
      method: 'POST',
      headers: {
        'xi-api-key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json({ error: 'Failed to create batch call', details: errorData }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error("Error in POST /api/batch-calls:", error);
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}