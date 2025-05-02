import React, { useEffect, useState } from 'react';

export default function Healthcheck() {
  const [apiStatus, setApiStatus] = useState<string>('Loading...');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkApi = async () => {
      try {
        const response = await fetch('/api/languages');
        if (response.ok) {
          const data = await response.json();
          setApiStatus(`Connected successfully! Found ${data.length} languages.`);
        } else {
          setApiStatus(`Error: HTTP ${response.status}`);
          setError(`Unable to connect to API: ${response.statusText}`);
        }
      } catch (err) {
        setApiStatus('Connection failed');
        setError(`Error: ${err instanceof Error ? err.message : String(err)}`);
      }
    };

    checkApi();
  }, []);

  return (
    <div className="container mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-8">Application Health Check</h1>
      
      <div className="border rounded-lg p-6 mb-8 shadow-sm">
        <h2 className="text-xl font-semibold mb-4">API Connection Status</h2>
        <div className={`p-4 rounded-md ${apiStatus.includes('success') ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
          <p className="font-medium">{apiStatus}</p>
          {error && <p className="mt-2 text-red-600">{error}</p>}
        </div>
      </div>

      <div className="border rounded-lg p-6 shadow-sm">
        <h2 className="text-xl font-semibold mb-4">Frontend Information</h2>
        <ul className="space-y-2">
          <li><strong>React Rendering:</strong> ✅ Working</li>
          <li><strong>Current Time:</strong> {new Date().toLocaleTimeString()}</li>
          <li><strong>Browser:</strong> {navigator.userAgent}</li>
        </ul>
      </div>
    </div>
  );
}