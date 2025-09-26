'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';

interface Message {
  text: string;
  isUser: boolean;
}

interface Agent {
  agent_id: string;
  name: string;
  conversation_config: {
    tts: {
      voice_id: string;
    };
  };
}

export default function AgentPage() {
  const { agentId } = useParams();
  const [agent, setAgent] = useState<Agent | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    async function fetchAgentDetails() {
      if (!agentId) return;
      try {
        const response = await fetch(`/api/agents/${agentId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch agent details');
        }
        const data = await response.json();
        setAgent(data);
      } catch (error) {
        console.error(error);
      }
    }

    fetchAgentDetails();
  }, [agentId]);

  const handleSend = async () => {
    if (!input.trim() || !agent || isPlaying) return;

    const userMessage = { text: input, isUser: true };
    setMessages((prev) => [...prev, userMessage]);

    // WORKAROUND: Simulate the agent's text response immediately.
    // In a real implementation with a text-in/text-out API, you would wait for the actual response.
    const agentResponseText = `You said: "${input}"`;
    const agentMessage = { text: agentResponseText, isUser: false };
    setMessages((prev) => [...prev, agentMessage]);

    setInput('');
    setIsPlaying(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: input,
          voiceId: agent.conversation_config.tts.voice_id,
        }),
      });

      if (!response.ok) {
        throw new Error(`Audio generation failed: ${await response.text()}`);
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);

      if (audioRef.current) {
        audioRef.current.src = url;
        audioRef.current.play();
      }
    } catch (error) {
      console.error('Error fetching or playing audio:', error);
      setIsPlaying(false); // Reset playing state on error
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <main className="flex-grow max-w-7xl w-full mx-auto py-6 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-semibold text-gray-900 mb-4">
          Test Agent: {agent?.name || 'Loading...'}
        </h1>
        <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 mb-4" role="alert">
            <p className="font-bold">Developer Note</p>
            <p>This chat interface is a simulation. Due to environmental limitations preventing a live WebSocket connection, this feature does not connect to the agent's conversational logic. It demonstrates the text-to-speech and audio playback functionality by echoing your message.</p>
        </div>
        <div className="bg-white shadow overflow-hidden sm:rounded-md h-full flex flex-col">
          <div className="flex-grow p-4 space-y-4 overflow-y-auto">
            {messages.map((msg, index) => (
              <div key={index} className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'}`}>
                <div className={`px-4 py-2 rounded-lg ${msg.isUser ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'}`}>
                  {msg.text}
                </div>
              </div>
            ))}
          </div>
          <div className="p-4 bg-gray-50 border-t">
            <div className="flex space-x-4">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                className="flex-grow px-3 py-2 border border-gray-300 rounded-md"
                placeholder="Type your message..."
                disabled={isPlaying}
              />
              <button
                onClick={handleSend}
                disabled={isPlaying}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400"
              >
                {isPlaying ? '...' : 'Send'}
              </button>
            </div>
          </div>
        </div>
      </main>
      <audio ref={audioRef} onEnded={() => setIsPlaying(false)} hidden />
    </div>
  );
}