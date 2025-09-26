'use client';

import { useState } from 'react';

interface CreateAgentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAgentCreated: () => void;
}

export default function CreateAgentModal({ isOpen, onClose, onAgentCreated }: CreateAgentModalProps) {
  const [name, setName] = useState('');
  const [prompt, setPrompt] = useState('You are a helpful assistant.');
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    setError(null);

    // A default voice. In a real application, you'd fetch available voices
    // and let the user choose.
    const voiceId = "pNInz6obpgDQGcFmaJgB";

    const agentConfig = {
      name,
      conversation_config: {
        agent: {
          prompt,
          llm: { model: "eleven-multilingual-v1", temperature: 0.3 },
          language: "en",
          tools: [],
        },
        tts: {
          model: "eleven-multilingual-v1",
          voice_id: voiceId,
        },
        asr: { model: "nova-2-general", language: "auto" },
        conversation: { max_duration_seconds: 1800, text_only: false },
      },
      platform_settings: {},
      tags: [],
    };

    try {
      const response = await fetch('/api/agents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(agentConfig),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create agent');
      }

      onAgentCreated();
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsCreating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="mt-3 text-center">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Create New Agent</h3>
          <form onSubmit={handleSubmit} className="mt-2 text-left">
            <div className="mb-4">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">Agent Name</label>
              <input
                type="text"
                name="name"
                id="name"
                className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="mb-4">
              <label htmlFor="prompt" className="block text-sm font-medium text-gray-700">System Prompt</label>
              <textarea
                name="prompt"
                id="prompt"
                rows={4}
                className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                required
              />
            </div>
            {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
            <div className="items-center px-4 py-3">
              <button
                id="ok-btn"
                className="px-4 py-2 bg-blue-600 text-white text-base font-medium rounded-md w-full shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                type="submit"
                disabled={isCreating}
              >
                {isCreating ? 'Creating...' : 'Create Agent'}
              </button>
            </div>
          </form>
          <div className="items-center px-4 py-3">
             <button
                className="px-4 py-2 bg-gray-200 text-gray-800 text-base font-medium rounded-md w-full shadow-sm hover:bg-gray-300 focus:outline-none"
                onClick={onClose}
              >
                Cancel
              </button>
          </div>
        </div>
      </div>
    </div>
  );
}