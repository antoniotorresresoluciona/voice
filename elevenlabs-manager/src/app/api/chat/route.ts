import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const apiKey = process.env.ELEVENLABS_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ error: 'ElevenLabs API key not found' }, { status: 500 });
  }

  try {
    const { message, voiceId } = await request.json();

    if (!message || !voiceId) {
      return NextResponse.json({ error: 'Missing message or voiceId' }, { status: 400 });
    }

    // WORKAROUND: Since we cannot establish a WebSocket connection to the agent
    // for a text-in/text-out conversation, we will simulate the agent's response.
    // For this demo, we'll just echo back the user's message as the agent's response text.
    // In a real scenario, this would be the text response from the agent.
    const agentResponseText = `You said: "${message}"`;

    // Now, take the agent's text response and convert it to speech
    const ttsResponse = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/stream`, {
      method: 'POST',
      headers: {
        'xi-api-key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: agentResponseText,
        model_id: 'eleven_multilingual_v2',
      }),
    });

    if (!ttsResponse.ok || !ttsResponse.body) {
      const errorData = await ttsResponse.json();
      return NextResponse.json({ error: 'Failed to stream audio from ElevenLabs', details: errorData }, { status: ttsResponse.status });
    }

    // Stream the audio back to the client
    const stream = new ReadableStream({
      async start(controller) {
        const reader = ttsResponse.body!.getReader();
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          controller.enqueue(value);
        }
        controller.close();
      },
    });

    return new Response(stream, {
      headers: { 'Content-Type': 'audio/mpeg' },
    });

  } catch (error) {
    console.error('Error in chat API:', error);
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}