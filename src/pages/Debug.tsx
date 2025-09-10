import React from 'react';
import { API_BASE_URL } from '../config/api';

export default function Debug() {
  const testBackend = async () => {
    try {
      console.log('Testing backend connection...');
      console.log('API_BASE_URL:', API_BASE_URL);
      
      const response = await fetch(`${API_BASE_URL}/health`);
      const data = await response.json();
      
      console.log('Health check response:', data);
      alert(`Backend is ${response.ok ? 'working' : 'not working'}. Response: ${JSON.stringify(data)}`);
    } catch (error) {
      console.error('Backend test failed:', error);
      alert(`Backend test failed: ${error.message}`);
    }
  };

  const testLogin = async () => {
    try {
      console.log('Testing login...');
      
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'alice@acme.com',
          password: 'password123'
        }),
      });
      
      const data = await response.json();
      console.log('Login test response:', data);
      alert(`Login test: ${response.ok ? 'SUCCESS' : 'FAILED'}. Response: ${JSON.stringify(data)}`);
    } catch (error) {
      console.error('Login test failed:', error);
      alert(`Login test failed: ${error.message}`);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Debug Page</h1>
      
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold">Environment Info:</h2>
          <p><strong>API_BASE_URL:</strong> {API_BASE_URL}</p>
          <p><strong>Environment:</strong> {import.meta.env.MODE}</p>
          <p><strong>Production:</strong> {import.meta.env.PROD ? 'Yes' : 'No'}</p>
        </div>
        
        <div className="space-x-2">
          <button 
            onClick={testBackend}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Test Backend Health
          </button>
          
          <button 
            onClick={testLogin}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Test Login
          </button>
        </div>
        
        <div>
          <h3 className="text-lg font-semibold">Instructions:</h3>
          <ol className="list-decimal list-inside space-y-1">
            <li>Open browser developer tools (F12)</li>
            <li>Go to Console tab</li>
            <li>Click the test buttons above</li>
            <li>Check console logs for detailed error information</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
