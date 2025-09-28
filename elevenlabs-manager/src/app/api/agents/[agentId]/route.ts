import { NextResponse } from 'next/server';

// GET a single agent
export async function GET(request: Request, { params }: { params: { agentId: string } }) {
  const apiKey = process.env.ELEVENLABS_API_KEY;
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
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}

// UPDATE an agent
export async function PUT(request: Request, { params }: { params: { agentId: string } }) {
  const apiKey = process.env.ELEVENLABS_API_KEY;
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
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}

// DELETE an agent
export async function DELETE(request: Request, { params }: { params: { agentId: string } }) {
  const apiKey = process.env.ELEVENLABS_API_KEY;
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
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}