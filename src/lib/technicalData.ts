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
  // Geolocation data
  country?: string;
  city?: string;
  region?: string;
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

// Get IP geolocation data
export async function getIPGeolocation(ip: string): Promise<{
  country?: string;
  city?: string;
  region?: string;
}> {
  try {
    // Skip geolocation for localhost and private IPs
    if (ip === '::1' || ip === '127.0.0.1' || ip.startsWith('192.168.') || ip.startsWith('10.') || ip.startsWith('172.')) {
      return {};
    }
    
    // Try primary service: ipapi.co with timeout
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch(`https://ipapi.co/${ip}/json/`, {
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        const data = await response.json();
        
        if (!data.error) {
          const result = {
            country: data.country_name || data.country,
            city: data.city,
            region: data.region
          };
          
          if (result.country) {
            return result;
          }
        }
      }
    } catch {
      // Silently handle errors
    }
    
    // Fallback to ipinfo.io with timeout
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const fallbackResponse = await fetch(`https://ipinfo.io/${ip}/json`, {
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (fallbackResponse.ok) {
        const fallbackData = await fallbackResponse.json();
        
        const result = {
          country: getCountryName(fallbackData.country || ''),
          city: fallbackData.city,
          region: fallbackData.region
        };
        
        if (result.country) {
          return result;
        }
      }
    } catch {
      // Silently handle errors
    }
    
    return {};
  } catch {
    return {};
  }
}

// Convert country code to country name
function getCountryName(code: string): string {
  const countries: Record<string, string> = {
    'AE': 'United Arab Emirates',
    'US': 'United States',
    'GB': 'United Kingdom',
    'UK': 'United Kingdom',
    'DE': 'Germany',
    'FR': 'France',
    'JP': 'Japan',
    'CN': 'China',
    'IN': 'India',
    'CA': 'Canada',
    'AU': 'Australia',
    'SG': 'Singapore',
    'SA': 'Saudi Arabia',
    'IT': 'Italy',
    'ES': 'Spain',
    'NL': 'Netherlands',
    'BR': 'Brazil',
    'MX': 'Mexico',
    'RU': 'Russia',
    'KR': 'South Korea',
    'SE': 'Sweden',
    'NO': 'Norway',
    'DK': 'Denmark',
    'FI': 'Finland',
    'CH': 'Switzerland',
    'AT': 'Austria',
    'BE': 'Belgium',
    'IE': 'Ireland',
    'PT': 'Portugal',
    'GR': 'Greece',
    'TR': 'Turkey',
    'EG': 'Egypt',
    'ZA': 'South Africa',
    'NG': 'Nigeria',
    'KE': 'Kenya',
    'PL': 'Poland',
    'CZ': 'Czech Republic',
    'HU': 'Hungary',
    'RO': 'Romania',
    'HR': 'Croatia',
    'BG': 'Bulgaria',
    'LT': 'Lithuania',
    'LV': 'Latvia',
    'EE': 'Estonia',
    'SK': 'Slovakia',
    'SI': 'Slovenia',
    'LU': 'Luxembourg',
    'MT': 'Malta',
    'CY': 'Cyprus'
  };
  
  return countries[code.toUpperCase()] || code;
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
