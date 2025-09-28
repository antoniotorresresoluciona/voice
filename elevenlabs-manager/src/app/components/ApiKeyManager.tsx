'use client';

import { useState } from 'react';

export default function ApiKeyManager() {
  const [apiKey, setApiKey] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const handleSave = () => {
    if (apiKey.trim()) {
      sessionStorage.setItem('elevenlabs_api_key', apiKey);
      setIsOpen(false);
      alert('API Key saved for this session. The page will now reload.');
      window.location.reload();
    }
  };

  return (
    <div>
      <button
        onClick={() => setIsOpen(true)}
        className="ml-4 inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        Set API Key
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg leading-6 font-medium text-gray-900 text-center">Set Your ElevenLabs API Key</h3>
              <div className="mt-4">
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  placeholder="Enter your API key..."
                />
              </div>
              <div className="mt-4 flex justify-end space-x-2">
                <button
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-800 text-base font-medium rounded-md shadow-sm hover:bg-gray-300 focus:outline-none"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="px-4 py-2 bg-blue-600 text-white text-base font-medium rounded-md shadow-sm hover:bg-blue-700 focus:outline-none"
                >
                  Save for Session
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}