'use client';

import { useEffect, useState } from 'react';
import { getApiHeaders } from '../utils/api';

interface Conversation {
  conversation_id: string;
  agent_name: string;
  call_duration_secs: number;
  status: string;
  call_successful: string;
  has_audio: boolean;
}

export default function StatisticsPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchConversations() {
      try {
        const response = await fetch('/api/conversations', { headers: getApiHeaders() });
        const data = await response.json();
        setConversations(data.conversations || []);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('An unknown error occurred while fetching conversations.');
        }
      } finally {
        setLoading(false);
      }
    }

    fetchConversations();
  }, []);

  const handleDownloadAudio = async (conversationId: string) => {
    try {
      const response = await fetch(`/api/conversations/${conversationId}/audio`, { headers: getApiHeaders() });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to download audio');
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${conversationId}.mp3`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
    } catch (err) {
      if (err instanceof Error) {
        alert(`Error downloading audio: ${err.message}`);
      } else {
        alert('An unknown error occurred while downloading audio.');
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-semibold text-gray-900 mb-4">Call Statistics & History</h1>
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul role="list" className="divide-y divide-gray-200">
          {loading && <li className="p-4">Loading conversations...</li>}
          {error && <li className="p-4 text-red-500">Error: {error}</li>}
          {!loading && conversations.length === 0 && (
            <li className="p-4">No conversations found.</li>
          )}
          {conversations.map((convo) => (
            <li key={convo.conversation_id}>
              <div className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <p className="text-md font-medium text-blue-700 truncate">
                    Agent: {convo.agent_name}
                  </p>
                  <div className="ml-2 flex-shrink-0 flex items-center space-x-4">
                    <p className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      convo.call_successful === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {convo.call_successful}
                    </p>
                    {convo.has_audio && (
                       <button
                         onClick={() => handleDownloadAudio(convo.conversation_id)}
                         className="text-sm font-medium text-blue-600 hover:text-blue-500"
                       >
                         Download Audio
                       </button>
                    )}
                  </div>
                </div>
                <div className="mt-2 sm:flex sm:justify-between">
                  <div className="sm:flex">
                    <p className="flex items-center text-sm text-gray-500">
                      Duration: {convo.call_duration_secs}s
                    </p>
                  </div>
                  <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                    <p>
                      Status: {convo.status}
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