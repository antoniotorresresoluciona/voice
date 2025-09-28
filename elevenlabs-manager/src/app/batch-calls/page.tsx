'use client';

import { useEffect, useState } from 'react';
import { getApiHeaders } from '../utils/api';

interface BatchCall {
  batch_call_id: string;
  status: string;
  // Add other relevant fields from the API response
}

interface Agent {
  agent_id: string;
  name: string;
}

export default function BatchCallsPage() {
  const [batchCalls, setBatchCalls] = useState<BatchCall[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [selectedAgent, setSelectedAgent] = useState('');
  const [csvUrl, setCsvUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch agents for the dropdown
        const agentsResponse = await fetch('/api/agents', { headers: getApiHeaders() });
        const agentsData = await agentsResponse.json();
        setAgents(agentsData.agents || []);

        // Fetch existing batch calls
        const batchCallsResponse = await fetch('/api/batch-calls', { headers: getApiHeaders() });
        const batchCallsData = await batchCallsResponse.json();
        setBatchCalls(batchCallsData.batch_calls || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAgent || !csvUrl) {
      setError('Please select an agent and provide a CSV URL.');
      return;
    }
    setError(null);

    try {
      const response = await fetch('/api/batch-calls', {
        method: 'POST',
        headers: getApiHeaders(),
        body: JSON.stringify({
          agent_id: selectedAgent,
          csv_url: csvUrl,
          // Add other necessary parameters from the docs
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create batch call');
      }

      // Refresh the list of batch calls
      const batchCallsResponse = await fetch('/api/batch-calls', { headers: getApiHeaders() });
      const batchCallsData = await batchCallsResponse.json();
      setBatchCalls(batchCallsData.batch_calls || []);
      setCsvUrl('');

    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-semibold text-gray-900 mb-4">Batch Calls</h1>

      {/* Create Batch Call Form */}
      <div className="bg-white shadow sm:rounded-lg mb-8">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Create a New Batch Call</h3>
          <form onSubmit={handleSubmit} className="mt-5 sm:flex sm:items-center">
            <div className="w-full sm:max-w-xs">
              <label htmlFor="agent" className="sr-only">Agent</label>
              <select
                id="agent"
                name="agent"
                className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                value={selectedAgent}
                onChange={(e) => setSelectedAgent(e.target.value)}
              >
                <option value="">Select an Agent</option>
                {agents.map((agent) => (
                  <option key={agent.agent_id} value={agent.agent_id}>{agent.name}</option>
                ))}
              </select>
            </div>
            <div className="mt-3 sm:mt-0 sm:ml-3 w-full">
                <label htmlFor="csvUrl" className="sr-only">CSV URL</label>
                <input
                    type="text"
                    name="csvUrl"
                    id="csvUrl"
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    placeholder="https://example.com/recipients.csv"
                    value={csvUrl}
                    onChange={(e) => setCsvUrl(e.target.value)}
                />
            </div>
            <button
              type="submit"
              className="mt-3 w-full inline-flex items-center justify-center px-4 py-2 border border-transparent shadow-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
            >
              Start Batch Call
            </button>
          </form>
          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
        </div>
      </div>

      {/* Batch Calls List */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul role="list" className="divide-y divide-gray-200">
          {loading && <li className="p-4">Loading batch calls...</li>}
          {!loading && batchCalls.length === 0 && (
            <li className="p-4">No batch calls found.</li>
          )}
          {batchCalls.map((call) => (
            <li key={call.batch_call_id}>
              <div className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <p className="text-md font-medium text-blue-700 truncate">
                    ID: {call.batch_call_id}
                  </p>
                  <div className="ml-2 flex-shrink-0 flex">
                    <p className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        call.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {call.status}
                    </p>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}