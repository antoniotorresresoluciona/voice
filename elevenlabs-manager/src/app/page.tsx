'use client';

import { useEffect, useState, useCallback } from 'react';
import CreateAgentModal from './components/CreateAgentModal';
import EditAgentModal from './components/EditAgentModal';
import { getApiHeaders } from './utils/api';

// Define the structure of an agent based on the API response
interface Agent {
  agent_id: string;
  name: string;
  tags: string[];
  created_at_unix_secs: number;
  access_info: {
    is_creator: boolean;
    creator_name: string;
    creator_email: string;
    role: string;
  };
  conversation_config: {
    agent: {
      prompt: string;
    };
  };
}

export default function Home() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [showApiKeyWarning, setShowApiKeyWarning] = useState(false);

  const fetchAgents = useCallback(async () => {
    setLoading(true);
    setError(null);
    setShowApiKeyWarning(false);
    try {
      const response = await fetch('/api/agents', { headers: getApiHeaders() });
      if (!response.ok) {
        const errorData = await response.json();
        if (errorData.error === 'ElevenLabs API key not found') {
          setShowApiKeyWarning(true);
        }
        throw new Error(errorData.error || 'Failed to fetch agents');
      }
      const data = await response.json();
      setAgents(data.agents || []);
    } catch (err) {
      if (!showApiKeyWarning) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('An unknown error occurred');
        }
      }
    } finally {
      setLoading(false);
    }
  }, [showApiKeyWarning]);

  useEffect(() => {
    fetchAgents();
  }, [fetchAgents]);

  const handleAgentCreated = () => {
    fetchAgents();
    setCreateModalOpen(false);
  };

  const handleAgentUpdated = () => {
    fetchAgents();
    setEditModalOpen(false);
  };

  const handleEditClick = (agent: Agent) => {
    setSelectedAgent(agent);
    setEditModalOpen(true);
  };

  const handleDeleteClick = async (agentId: string) => {
    if (window.confirm('Are you sure you want to delete this agent?')) {
      try {
        const response = await fetch(`/api/agents/${agentId}`, {
          method: 'DELETE',
          headers: getApiHeaders(),
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to delete agent');
        }
        fetchAgents();
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('An unknown error occurred');
        }
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <CreateAgentModal
        isOpen={isCreateModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onAgentCreated={handleAgentCreated}
      />
      <EditAgentModal
        isOpen={isEditModalOpen}
        onClose={() => setEditModalOpen(false)}
        onAgentUpdated={handleAgentUpdated}
        agent={selectedAgent}
      />
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {showApiKeyWarning && (
          <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4" role="alert">
            <p className="font-bold">Configuration Needed</p>
            <p>Your ElevenLabs API key is not set. Please create a <code>.env.local</code> file in the project root and add your API key as <code>ELEVENLABS_API_KEY=your_key_here</code>. Then, restart the development server.</p>
          </div>
        )}
        <div className="flex justify-end mb-4">
          <button
            onClick={() => setCreateModalOpen(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Create Agent
          </button>
        </div>
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul role="list" className="divide-y divide-gray-200">
            {loading && <li className="p-4">Loading agents...</li>}
            {error && <li className="p-4 text-red-500">Error: {error}</li>}
            {!loading && !error && !showApiKeyWarning && agents.length === 0 && (
              <li className="p-4">No agents found.</li>
            )}
            {!loading && !error && !showApiKeyWarning && agents.map((agent) => (
              <li key={agent.agent_id}>
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <p className="text-md font-medium text-blue-700 truncate">
                      {agent.name}
                    </p>
                    <div className="ml-2 flex-shrink-0 flex items-center space-x-4">
                      <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        {agent.access_info.role}
                      </p>
                      <button
                        onClick={() => handleEditClick(agent)}
                        className="text-sm font-medium text-yellow-600 hover:text-yellow-500"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteClick(agent.agent_id)}
                        className="text-sm font-medium text-red-600 hover:text-red-500"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  <div className="mt-2 sm:flex sm:justify-between">
                    <div className="sm:flex">
                      <p className="flex items-center text-sm text-gray-500">
                        ID: {agent.agent_id}
                      </p>
                    </div>
                    <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                      <p>
                        Created by {agent.access_info.creator_name}
                      </p>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </main>
    </div>
  );
}