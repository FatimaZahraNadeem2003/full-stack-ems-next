'use client';
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useEffect, useState } from 'react';
import { testBackendConnection } from '@/services/testConnection';
import http from '@/services/http';
import { Link } from 'lucide-react';

interface SystemStatus {
  mongoDB: boolean;
  backend: boolean;
  frontend: boolean;
  apiEndpoints: boolean;
}

export default function SystemStatus() {
  const [status, setStatus] = useState<SystemStatus>({
    mongoDB: false,
    backend: false,
    frontend: false,
    apiEndpoints: false,
  });
  const [logs, setLogs] = useState<string[]>([]);
  const [checking, setChecking] = useState(false);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `[${timestamp}] ${message}`]);
  };

  const checkSystem = async () => {
    setChecking(true);
    setLogs([]);
    
    try {
      setStatus(prev => ({ ...prev, frontend: true }));
      addLog('✅ Frontend is running');

      addLog('🔍 Checking backend connection...');
      const backendResult = await testBackendConnection();
      
      if (backendResult.success) {
        setStatus(prev => ({ ...prev, backend: true }));
        addLog('✅ Backend server is accessible');
        
        addLog('🔍 Testing API endpoints...');
        try {
          const testResponse = await http.get('/test');
          setStatus(prev => ({ ...prev, apiEndpoints: true }));
          addLog('✅ API endpoints are responding');
        } catch (error: any) {
          if (error.response?.status === 404 || error.response?.status === 200) {
            
            setStatus(prev => ({ ...prev, apiEndpoints: true }));
            addLog('✅ API endpoints are responding');
          } else {
            addLog('⚠️ Some API endpoints may have issues');
          }
        }
        
        if (backendResult.data?.status === 'healthy') {
          setStatus(prev => ({ ...prev, mongoDB: true }));
          addLog('✅ MongoDB connection is healthy');
        } else {
          addLog('⚠️ MongoDB status unknown');
        }
      } else {
        addLog('❌ Backend connection failed: ' + backendResult.message);
      }
    } catch (error: any) {
      addLog('❌ System check failed: ' + error.message);
    } finally {
      setChecking(false);
    }
  };

  useEffect(() => {
    checkSystem();
  }, []);

  const getStatusColor = (ok: boolean) => ok ? '#28a745' : '#dc3545';
  const getStatusIcon = (ok: boolean) => ok ? '✅' : '❌';

  return (
    <div style={{ 
      padding: '40px', 
      fontFamily: 'Arial, sans-serif',
      maxWidth: '900px',
      margin: '0 auto'
    }}>
      <h1 style={{ color: '#333', marginBottom: '30px' }}>
        📊 System Status Dashboard
      </h1>

      <button
        onClick={checkSystem}
        disabled={checking}
        style={{
          padding: '12px 24px',
          fontSize: '16px',
          backgroundColor: checking ? '#ccc' : '#0070f3',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: checking ? 'not-allowed' : 'pointer',
          marginBottom: '30px'
        }}
      >
        {checking ? '🔄 Checking...' : '🔄 Refresh Status'}
      </button>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '20px',
        marginBottom: '30px'
      }}>
        <StatusCard 
          title="Frontend" 
          status={status.frontend} 
          icon="🖥️"
        />
        <StatusCard 
          title="Backend" 
          status={status.backend} 
          icon="⚙️"
        />
        <StatusCard 
          title="MongoDB" 
          status={status.mongoDB} 
          icon="🗄️"
        />
        <StatusCard 
          title="API Endpoints" 
          status={status.apiEndpoints} 
          icon="🔌"
        />
      </div>

      <div style={{ 
        padding: '20px', 
        borderRadius: '8px',
        background: Object.values(status).every(s => s) ? '#d4edda' : '#fff3cd',
        border: `2px solid ${Object.values(status).every(s => s) ? '#28a745' : '#ffc107'}`,
        marginBottom: '30px'
      }}>
        <h2 style={{ margin: '0 0 10px 0', color: '#333' }}>
          {Object.values(status).every(s => s) ? '🎉 All Systems Operational' : '⚠️ Some Issues Detected'}
        </h2>
        <p style={{ margin: 0, color: '#666' }}>
          {Object.values(status).filter(s => s).length} of {Object.values(status).length} systems working properly
        </p>
      </div>

      <div style={{ 
        background: '#1e1e1e', 
        padding: '20px', 
        borderRadius: '8px',
        fontFamily: 'Consolas, monospace',
        fontSize: '13px',
        color: '#d4d4d4',
        maxHeight: '400px',
        overflowY: 'auto'
      }}>
        <h3 style={{ color: '#fff', marginTop: 0 }}>System Logs</h3>
        {logs.length === 0 ? (
          <p style={{ color: '#666' }}>No logs yet. {`Click "Refresh Status"`} to run diagnostics.</p>
        ) : (
          logs.map((log, index) => (
            <div key={index} style={{ marginBottom: '5px' }}>
              {log}
            </div>
          ))
        )}
      </div>

      <div style={{ marginTop: '30px' }}>
        <h3>Quick Actions</h3>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <Link 
            href="http://localhost:5000" 
            target="_blank"
            style={{
              padding: '10px 20px',
              background: '#0070f3',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '4px'
            }}
          >
            🔗 Test Backend
          </Link>
          <Link
            href="http://localhost:5000/api/v1/health"
            target="_blank"
            style={{
              padding: '10px 20px',
              background: '#28a745',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '4px'
            }}
          >
            🏥 Health Check
          </Link>
          <Link
            href="/" 
            style={{
              padding: '10px 20px',
              background: '#6c757d',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '4px'
            }}
          >
            🏠 Go Home
          </Link>
        </div>
      </div>
    </div>
  );
}

function StatusCard({ title, status, icon }: { title: string; status: boolean; icon: string }) {
  return (
    <div style={{
      padding: '20px',
      borderRadius: '8px',
      background: '#fff',
      border: `3px solid ${status ? '#28a745' : '#dc3545'}`,
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      textAlign: 'center'
    }}>
      <div style={{ fontSize: '40px', marginBottom: '10px' }}>{icon}</div>
      <h3 style={{ margin: '0 0 10px 0', color: '#333' }}>{title}</h3>
      <div style={{ 
        fontSize: '18px', 
        fontWeight: 'bold',
        color: status ? '#28a745' : '#dc3545'
      }}>
        {status ? '✅ Working' : '❌ Down'}
      </div>
    </div>
  );
}
