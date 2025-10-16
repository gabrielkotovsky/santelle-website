'use client';

import { useEffect, useRef, useCallback } from 'react';
import {
  isSessionValid,
  getCurrentSession,
  createNewSession,
  updateSessionActivity,
  clearSession,
  getDeviceType,
  getReferrer,
  type SessionData
} from '@/lib/sessionTracking';

const HEARTBEAT_INTERVAL = 60 * 1000; // 1 minute

export default function SessionTracker() {
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const sessionRef = useRef<SessionData | null>(null);

  /**
   * Initialize or resume session
   */
  const initializeSession = useCallback(async () => {
    try {
      console.log('[SessionTracker] Initializing session...');
      
      // Check if there's a valid existing session
      if (isSessionValid()) {
        const existingSession = getCurrentSession();
        if (existingSession) {
          console.log('[SessionTracker] Resuming existing session:', existingSession.session_id);
          sessionRef.current = existingSession;
          updateSessionActivity();
          return;
        }
      }

      // Create new session
      const newSession = createNewSession();
      sessionRef.current = newSession;
      console.log('[SessionTracker] Created new session:', newSession.session_id);

      // Send session data to server
      const device = getDeviceType();
      const referrer = getReferrer();

      console.log('[SessionTracker] Sending session to API:', {
        session_id: newSession.session_id,
        uid: newSession.uid,
        device,
        referrer
      });

      const response = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: newSession.session_id,
          uid: newSession.uid,
          device,
          referrer
        })
      });

      const result = await response.json();
      console.log('[SessionTracker] API response:', result);

      if (!response.ok) {
        console.error('[SessionTracker] Failed to create session:', result);
      }
    } catch (error) {
      console.error('[SessionTracker] Error initializing session:', error);
    }
  }, []);

  /**
   * End current session
   */
  const endSession = useCallback(async () => {
    if (!sessionRef.current) return;

    try {
      await fetch('/api/sessions', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: sessionRef.current.session_id
        })
      });

      clearSession();
      sessionRef.current = null;
    } catch (error) {
      console.error('Error ending session:', error);
    }
  }, []);

  /**
   * Send heartbeat to keep session alive
   */
  const sendHeartbeat = useCallback(() => {
    if (sessionRef.current) {
      updateSessionActivity();
    }
  }, []);

  /**
   * Handle page visibility changes
   */
  const handleVisibilityChange = useCallback(() => {
    if (document.hidden) {
      // Tab hidden - user might be leaving
      // We don't end the session immediately to allow tab switching
      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current);
        heartbeatIntervalRef.current = null;
      }
    } else {
      // Tab visible again
      if (isSessionValid()) {
        updateSessionActivity();
        // Restart heartbeat
        if (!heartbeatIntervalRef.current) {
          heartbeatIntervalRef.current = setInterval(sendHeartbeat, HEARTBEAT_INTERVAL);
        }
      } else {
        // Session expired, create new one
        initializeSession();
      }
    }
  }, [initializeSession, sendHeartbeat]);

  /**
   * Handle before unload (page close/navigate away)
   */
  const handleBeforeUnload = useCallback(() => {
    // Use sendBeacon for reliable data sending during page unload
    if (sessionRef.current && navigator.sendBeacon) {
      const blob = new Blob(
        [JSON.stringify({ session_id: sessionRef.current.session_id })],
        { type: 'application/json' }
      );
      navigator.sendBeacon('/api/sessions', blob);
    } else {
      // Fallback to synchronous request (not recommended but better than nothing)
      endSession();
    }
  }, [endSession]);

  useEffect(() => {
    // Initialize session on mount
    initializeSession();

    // Set up heartbeat interval
    heartbeatIntervalRef.current = setInterval(sendHeartbeat, HEARTBEAT_INTERVAL);

    // Add event listeners
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);

    // Cleanup on unmount
    return () => {
      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current);
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [initializeSession, sendHeartbeat, handleVisibilityChange, handleBeforeUnload]);

  // This component doesn't render anything
  return null;
}

