'use client';

import { useState, useEffect } from 'react';
import { getApiHeaders } from '../utils/api';

interface Agent {
  agent_id: string;
  name: string;
  conversation_config: {
    agent: {
      prompt: string;
    };
  };
}

interface EditAgentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAgentUpdated: () => void;
  agent: Agent | null;
}

export default function EditAgentModal({ isOpen, onClose, onAgentUpdated, agent }: EditAgentModalProps) {
  const [name, setName] = useState('');
  const [prompt, setPrompt] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (agent) {
      setName(agent.name);
      setPrompt(agent.conversation_config?.agent?.prompt || 'You are a helpful assistant.');
    }
  }, [agent]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agent) return;

    setIsUpdating(true);
    setError(null);

    const updatedConfig = {
      ...agent,
      name,
      conversation_config: {
        ...agent.conversation_config,
        agent: {
            ...agent.conversation_config.agent,
            prompt,
        }
      }
    };

    try {
      const response = await fetch(`/api/agents/${agent.agent_id}`, {
        method: 'PUT',
        headers: getApiHeaders(),
        body: JSON.stringify(updatedConfig),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update agent');
      }

      onAgentUpdated();
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsUpdating(false);
    }
  };

  if (!isOpen || !agent) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="mt-3 text-center">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Edit Agent</h3>
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
                className="px-4 py-2 bg-yellow-600 text-white text-base font-medium rounded-md w-full shadow-sm hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                type="submit"
                disabled={isUpdating}
              >
                {isUpdating ? 'Updating...' : 'Update Agent'}
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