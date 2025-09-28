import { NextResponse } from 'next/server';

function getApiKey(request: Request): string | null {
    return request.headers.get('X-Api-Key') || process.env.ELEVENLABS_API_KEY || null;
}

// GET a single agent
export async function GET(request: Request, { params }: { params: { agentId: string } }) {
  const apiKey = getApiKey(request);
  const { agentId } = params;

  if (!apiKey) {
    return NextResponse.json({ error: 'ElevenLabs API key not found' }, { status: 500 });
  }

  try {
    const response = await fetch(`https://api.elevenlabs.io/v1/convai/agents/${agentId}`, {
      headers: { 'xi-api-key': apiKey },
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json({ error: 'Failed to fetch agent', details: errorData }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error(`Error in GET /api/agents/${agentId}:`, error);
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}

// UPDATE an agent
export async function PUT(request: Request, { params }: { params: { agentId: string } }) {
  const apiKey = getApiKey(request);
  const { agentId } = params;

  if (!apiKey) {
    return NextResponse.json({ error: 'ElevenLabs API key not found' }, { status: 500 });
  }

  try {
    const body = await request.json();
    const response = await fetch(`https://api.elevenlabs.io/v1/convai/agents/${agentId}`, {
      method: 'PUT',
      headers: {
        'xi-api-key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json({ error: 'Failed to update agent', details: errorData }, { status: response.status });
    }

    return NextResponse.json({ message: 'Agent updated successfully' });
  } catch (error) {
    console.error(`Error in PUT /api/agents/${agentId}:`, error);
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}

// DELETE an agent
export async function DELETE(request: Request, { params }: { params: { agentId: string } }) {
  const apiKey = getApiKey(request);
  const { agentId } = params;

  if (!apiKey) {
    return NextResponse.json({ error: 'ElevenLabs API key not found' }, { status: 500 });
  }

  try {
    const response = await fetch(`https://api.elevenlabs.io/v1/convai/agents/${agentId}`, {
      method: 'DELETE',
      headers: { 'xi-api-key': apiKey },
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json({ error: 'Failed to delete agent', details: errorData }, { status: response.status });
    }

    return NextResponse.json({ message: 'Agent deleted successfully' }, { status: 204 });
  } catch (error) {
    console.error(`Error in DELETE /api/agents/${agentId}:`, error);
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}