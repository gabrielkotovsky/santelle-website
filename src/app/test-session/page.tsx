'use client';

import { useEffect, useState } from 'react';
import { 
  getOrCreateUID, 
  getCurrentSession, 
  isSessionValid,
  getDeviceType,
  getReferrer 
} from '@/lib/sessionTracking';

export default function TestSessionPage() {
  const [uid, setUid] = useState<string>('');
  const [session, setSession] = useState<any>(null);
  const [sessionValid, setSessionValid] = useState<boolean>(false);
  const [device, setDevice] = useState<string>('');
  const [referrer, setReferrer] = useState<string>('');

  useEffect(() => {
    // Get session info
    setUid(getOrCreateUID());
    setSession(getCurrentSession());
    setSessionValid(isSessionValid());
    setDevice(getDeviceType());
    setReferrer(getReferrer() || 'None');
  }, []);

  const refreshData = () => {
    setSession(getCurrentSession());
    setSessionValid(isSessionValid());
  };

  return (
    <div style={{ padding: '2rem', fontFamily: 'monospace' }}>
      <h1>Session Tracking Test Page</h1>
      
      <div style={{ marginTop: '2rem', padding: '1rem', background: '#f0f0f0', borderRadius: '8px' }}>
        <h2>Session Information</h2>
        <p><strong>UID:</strong> {uid}</p>
        <p><strong>Device:</strong> {device}</p>
        <p><strong>Referrer:</strong> {referrer}</p>
        <p><strong>Session Valid:</strong> {sessionValid ? 'Yes' : 'No'}</p>
        
        {session && (
          <div style={{ marginTop: '1rem' }}>
            <h3>Current Session:</h3>
            <pre style={{ background: '#fff', padding: '1rem', borderRadius: '4px' }}>
              {JSON.stringify(session, null, 2)}
            </pre>
          </div>
        )}
        
        {!session && (
          <p style={{ color: 'red' }}>⚠️ No active session found</p>
        )}
      </div>

      <div style={{ marginTop: '2rem' }}>
        <button 
          onClick={refreshData}
          style={{
            padding: '0.5rem 1rem',
            background: '#721422',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Refresh Session Data
        </button>
      </div>

      <div style={{ marginTop: '2rem', padding: '1rem', background: '#fff3cd', borderRadius: '8px' }}>
        <h3>Instructions:</h3>
        <ol>
          <li>Open your browser's Developer Console (F12)</li>
          <li>Look for logs starting with [SessionTracker] and [API /api/sessions]</li>
          <li>Check your Supabase dashboard → web_sessions table for new entries</li>
          <li>The UID should persist across page refreshes</li>
          <li>A new session should be created if you wait 30+ minutes or clear localStorage</li>
        </ol>
      </div>

      <div style={{ marginTop: '2rem', padding: '1rem', background: '#d1ecf1', borderRadius: '8px' }}>
        <h3>localStorage Contents:</h3>
        <pre style={{ background: '#fff', padding: '1rem', borderRadius: '4px', fontSize: '12px' }}>
          {typeof window !== 'undefined' ? JSON.stringify({
            santelle_uid: localStorage.getItem('santelle_uid'),
            santelle_session: localStorage.getItem('santelle_session')
          }, null, 2) : 'Loading...'}
        </pre>
      </div>
    </div>
  );
}

