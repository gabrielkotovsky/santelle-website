import { NextRequest } from 'next/server';

export interface TechnicalData {
  ipAddress: string;
  userAgent: string;
  browser: {
    name: string;
    version: string;
  };
  os: {
    name: string;
    version: string;
  };
  device: {
    type: 'desktop' | 'mobile' | 'tablet';
    isMobile: boolean;
    isTablet: boolean;
    isDesktop: boolean;
  };
  screen: {
    width: number | null;
    height: number | null;
  };
  language: string;
  timezone: string;
  referrer: string | null;
  timestamp: string;
}

export function extractTechnicalData(req: NextRequest): TechnicalData {
  // Get IP address
  const forwarded = req.headers.get("x-forwarded-for");
  const realIp = req.headers.get("x-real-ip");
  const cfConnectingIp = req.headers.get("cf-connecting-ip");
  
  let ip = 'unknown';
  if (cfConnectingIp) {
    ip = cfConnectingIp;
  } else if (realIp) {
    ip = realIp;
  } else if (forwarded) {
    ip = forwarded.split(",")[0].trim();
  }
  
  // Get User-Agent
  const userAgent = req.headers.get("user-agent") || 'unknown';
  
  // Parse User-Agent for browser and OS info
  const browserInfo = parseUserAgent(userAgent);
  
  // Get other headers
  const acceptLanguage = req.headers.get("accept-language") || 'en-US';
  const referer = req.headers.get("referer") || null;
  
  // Get timezone from Accept-Language header (fallback)
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  
  return {
    ipAddress: ip,
    userAgent,
    browser: browserInfo.browser,
    os: browserInfo.os,
    device: browserInfo.device,
    screen: {
      width: null, // Will be set by client-side JavaScript
      height: null
    },
    language: acceptLanguage.split(',')[0].split('-')[0], // Extract primary language
    timezone,
    referrer: referer,
    timestamp: new Date().toISOString()
  };
}

function parseUserAgent(userAgent: string) {
  // Default values
  const browser = { name: 'Unknown', version: 'Unknown' };
  const os = { name: 'Unknown', version: 'Unknown' };
  let device: {
    type: 'desktop' | 'mobile' | 'tablet';
    isMobile: boolean;
    isTablet: boolean;
    isDesktop: boolean;
  } = { 
    type: 'desktop', 
    isMobile: false, 
    isTablet: false, 
    isDesktop: true 
  };

  if (userAgent === 'unknown') {
    return { browser, os, device };
  }

  // Detect mobile/tablet
  const isMobile = /Mobile|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
  const isTablet = /iPad|Android(?=.*\bMobile\b)(?=.*\bSafari\b)/i.test(userAgent);
  
  const deviceType: 'desktop' | 'mobile' | 'tablet' = isTablet ? 'tablet' : isMobile ? 'mobile' : 'desktop';
  
  device = {
    type: deviceType,
    isMobile,
    isTablet,
    isDesktop: !isMobile && !isTablet
  };

  // Detect browser
  if (userAgent.includes('Chrome')) {
    browser.name = 'Chrome';
    const match = userAgent.match(/Chrome\/(\d+\.\d+)/);
    if (match) browser.version = match[1];
  } else if (userAgent.includes('Firefox')) {
    browser.name = 'Firefox';
    const match = userAgent.match(/Firefox\/(\d+\.\d+)/);
    if (match) browser.version = match[1];
  } else if (userAgent.includes('Safari')) {
    browser.name = 'Safari';
    const match = userAgent.match(/Version\/(\d+\.\d+)/);
    if (match) browser.version = match[1];
  } else if (userAgent.includes('Edge')) {
    browser.name = 'Edge';
    const match = userAgent.match(/Edge\/(\d+\.\d+)/);
    if (match) browser.version = match[1];
  }

  // Detect OS
  if (userAgent.includes('Windows')) {
    os.name = 'Windows';
    const match = userAgent.match(/Windows NT (\d+\.\d+)/);
    if (match) {
      const version = parseFloat(match[1]);
      if (version === 10.0) os.version = '10';
      else if (version === 6.3) os.version = '8.1';
      else if (version === 6.2) os.version = '8';
      else if (version === 6.1) os.version = '7';
      else os.version = match[1];
    }
  } else if (userAgent.includes('Mac OS X')) {
    os.name = 'macOS';
    const match = userAgent.match(/Mac OS X (\d+[._]\d+)/);
    if (match) os.version = match[1].replace('_', '.');
  } else if (userAgent.includes('Android')) {
    os.name = 'Android';
    const match = userAgent.match(/Android (\d+\.\d+)/);
    if (match) os.version = match[1];
  } else if (userAgent.includes('iOS')) {
    os.name = 'iOS';
    const match = userAgent.match(/OS (\d+[._]\d+)/);
    if (match) os.version = match[1].replace('_', '.');
  } else if (userAgent.includes('Linux')) {
    os.name = 'Linux';
    os.version = 'Unknown';
  }

  return { browser, os, device };
}

// Client-side function to get screen resolution
export function getScreenResolution(): { width: number; height: number } {
  if (typeof window !== 'undefined') {
    return {
      width: window.screen.width,
      height: window.screen.height
    };
  }
  return { width: 0, height: 0 };
}
