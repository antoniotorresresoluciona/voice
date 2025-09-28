import { NextResponse } from 'next/server';

function getApiKey(request: Request): string | null {
    return request.headers.get('X-Api-Key') || process.env.ELEVENLABS_API_KEY || null;
}

export async function GET(request: Request, { params }: { params: { conversationId: string } }) {
  const apiKey = getApiKey(request);
  const { conversationId } = params;

  if (!apiKey) {
    return NextResponse.json({ error: 'ElevenLabs API key not found' }, { status: 500 });
  }

  try {
    const response = await fetch(`https://api.elevenlabs.io/v1/convai/conversations/${conversationId}/audio`, {
      headers: { 'xi-api-key': apiKey },
    });

    if (!response.ok || !response.body) {
      const errorData = await response.json();
      return NextResponse.json({ error: 'Failed to fetch audio from ElevenLabs', details: errorData }, { status: response.status });
    }

    // Stream the audio back to the client
    const stream = new ReadableStream({
      async start(controller) {
        const reader = response.body!.getReader();
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          controller.enqueue(value);
        }
        controller.close();
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Disposition': `attachment; filename="${conversationId}.mp3"`,
       },
    });

  } catch (error) {
    console.error('Error fetching conversation audio:', error);
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}