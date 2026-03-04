'use client';

import { useEffect, useState } from 'react';
import { testBackendConnection } from '@/services/testConnection';

export default function ConnectionTest() {
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
    data?: any;
  } | null>(null);
  const [loading, setLoading] = useState(false);

  const runTest = async () => {
    setLoading(true);
    console.log('🧪 Starting backend connection test...');
    
    const result = await testBackendConnection();
    setTestResult(result);
    setLoading(false);
    
    if (result.success) {
      alert('✅ Backend connection successful!');
    } else {
      alert('❌ Backend connection failed: ' + result.message);
    }
  };

  useEffect(() => {
    runTest();
  }, []);

  return (
    <div style={{ 
      padding: '40px', 
      fontFamily: 'Arial, sans-serif',
      maxWidth: '800px',
      margin: '0 auto'
    }}>
      <h1 style={{ color: '#333', marginBottom: '20px' }}>
        🔍 Backend Connection Test
      </h1>
      
      <div style={{ 
        background: '#f5f5f5', 
        padding: '20px', 
        borderRadius: '8px',
        marginBottom: '20px'
      }}>
        <h2 style={{ color: '#666', fontSize: '16px' }}>API Configuration</h2>
        <p><strong>API URL:</strong> {process.env.NEXT_PUBLIC_API_URL || 'Not set'}</p>
        <p><strong>Node Env:</strong> {process.env.NODE_ENV}</p>
      </div>

      <button
        onClick={runTest}
        disabled={loading}
        style={{
          padding: '12px 24px',
          fontSize: '16px',
          backgroundColor: loading ? '#ccc' : '#0070f3',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: loading ? 'not-allowed' : 'pointer',
          marginBottom: '20px'
        }}
      >
        {loading ? 'Testing...' : '🔄 Run Connection Test'}
      </button>

      {testResult && (
        <div style={{ 
          padding: '20px', 
          borderRadius: '8px',
          background: testResult.success ? '#d4edda' : '#f8d7da',
          color: testResult.success ? '#155724' : '#721c24',
          border: `1px solid ${testResult.success ? '#c3e6cb' : '#f5c6cb'}`
        }}>
          <h2 style={{ fontSize: '18px', marginBottom: '10px' }}>
            {testResult.success ? '✅ Success' : '❌ Failed'}
          </h2>
          <p style={{ marginBottom: '10px' }}>{testResult.message}</p>
          
          {testResult.data && (
            <pre style={{ 
              background: 'rgba(0,0,0,0.1)', 
              padding: '10px', 
              borderRadius: '4px',
              overflow: 'auto',
              fontSize: '12px'
            }}>
              {JSON.stringify(testResult.data, null, 2)}
            </pre>
          )}
        </div>
      )}

      <div style={{ 
        marginTop: '30px', 
        padding: '20px', 
        background: '#fff3cd',
        borderRadius: '8px',
        border: '1px solid #ffeeba'
      }}>
        <h3 style={{ color: '#856404', marginTop: 0 }}>Troubleshooting Tips</h3>
        <ul style={{ color: '#856404', lineHeight: '1.8' }}>
          <li>Make sure the backend server is running on port 5000</li>
          <li>Check that MongoDB is running and accessible</li>
          <li>Verify the .env file has correct API_URL setting</li>
          <li>Check browser console for detailed error messages</li>
          <li>Ensure CORS is properly configured in backend</li>
        </ul>
      </div>
    </div>
  );
}
