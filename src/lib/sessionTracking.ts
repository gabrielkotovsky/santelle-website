/**
 * Session Tracking Utility
 * Manages user sessions and persistent user identification
 */

// Constants
const UID_KEY = 'santelle_uid';
const SESSION_KEY = 'santelle_session';
const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes in milliseconds

export interface SessionData {
  session_id: string;
  uid: string;
  started_at: string;
  last_activity: string;
}

/**
 * Generate a UUID v4
 */
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * Get or create persistent user ID
 * Stored in localStorage to track returning visitors
 */
export function getOrCreateUID(): string {
  if (typeof window === 'undefined') return '';
  
  try {
    let uid = localStorage.getItem(UID_KEY);
    
    if (!uid) {
      uid = generateUUID();
      localStorage.setItem(UID_KEY, uid);
    }
    
    return uid;
  } catch (error) {
    console.error('Error accessing localStorage for UID:', error);
    return generateUUID(); // Fallback to temporary UID
  }
}

/**
 * Check if current session is still valid
 */
export function isSessionValid(): boolean {
  if (typeof window === 'undefined') return false;
  
  try {
    const sessionData = localStorage.getItem(SESSION_KEY);
    
    if (!sessionData) return false;
    
    const session: SessionData = JSON.parse(sessionData);
    const lastActivity = new Date(session.last_activity).getTime();
    const now = Date.now();
    
    // Session is valid if less than SESSION_TIMEOUT has passed since last activity
    return (now - lastActivity) < SESSION_TIMEOUT;
  } catch (error) {
    console.error('Error checking session validity:', error);
    return false;
  }
}

/**
 * Get current session data
 */
export function getCurrentSession(): SessionData | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const sessionData = localStorage.getItem(SESSION_KEY);
    
    if (!sessionData) return null;
    
    return JSON.parse(sessionData);
  } catch (error) {
    console.error('Error getting current session:', error);
    return null;
  }
}

/**
 * Save session data to localStorage
 */
export function saveSession(session: SessionData): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  } catch (error) {
    console.error('Error saving session:', error);
  }
}

/**
 * Update last activity timestamp
 */
export function updateSessionActivity(): void {
  const session = getCurrentSession();
  
  if (session) {
    session.last_activity = new Date().toISOString();
    saveSession(session);
  }
}

/**
 * Clear session data
 */
export function clearSession(): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.removeItem(SESSION_KEY);
  } catch (error) {
    console.error('Error clearing session:', error);
  }
}

/**
 * Create a new session
 */
export function createNewSession(): SessionData {
  const now = new Date().toISOString();
  const session: SessionData = {
    session_id: generateUUID(),
    uid: getOrCreateUID(),
    started_at: now,
    last_activity: now,
  };
  
  saveSession(session);
  return session;
}

/**
 * Get device type from user agent
 */
export function getDeviceType(): 'mobile' | 'tablet' | 'desktop' {
  if (typeof window === 'undefined') return 'desktop';
  
  const userAgent = navigator.userAgent;
  
  if (/iPad/i.test(userAgent)) return 'tablet';
  if (/Android(?=.*\bMobile\b)(?=.*\bSafari\b)/i.test(userAgent)) return 'mobile';
  if (/Mobile|Android|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)) return 'mobile';
  
  return 'desktop';
}

/**
 * Get referrer
 */
export function getReferrer(): string | null {
  if (typeof document === 'undefined') return null;
  return document.referrer || null;
}

/**
 * Calculate session duration in seconds
 */
export function getSessionDuration(session: SessionData): number {
  const started = new Date(session.started_at).getTime();
  const ended = Date.now();
  return Math.floor((ended - started) / 1000); // Duration in seconds
}

