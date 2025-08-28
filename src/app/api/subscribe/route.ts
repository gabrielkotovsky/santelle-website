import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { supabaseAdmin } from '@/lib/supabase';
import { extractTechnicalData, getIPGeolocation } from '@/lib/technicalData';
import DOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';
import { validateRequestBody, subscribeSchema } from '@/middleware/validation';
import { withErrorHandler, Errors } from '@/middleware/errorHandler';

const resend = new Resend(process.env.RESEND_API_KEY!);

// Create a JSDOM instance for server-side DOMPurify
const window = new JSDOM('').window;
const purify = DOMPurify(window as unknown as typeof window);

// Input sanitization function
function sanitizeInput(input: string): string {
  return purify.sanitize(input, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] });
}

async function subscribeHandler(req: NextRequest) {
  // Validate request body using middleware
  let validatedBody;
  try {
    validatedBody = await validateRequestBody(req, subscribeSchema);
  } catch (validationError) {
    const errorMessage = validationError instanceof Error ? validationError.message : 'Validation failed';
    throw Errors.validation(errorMessage);
  }

  const { email, screenData } = validatedBody;

  // Sanitize email (already validated by middleware)
  const sanitizedEmail = sanitizeInput(email.trim().toLowerCase());

  // Extract technical data from the request (non-blocking)
  let technicalData;
  let geoData: { country?: string; city?: string; region?: string } = {};
  
  try {
    technicalData = extractTechnicalData(req);
    
    // Merge screen data from client if provided
    if (screenData && typeof screenData === 'object') {
      const width = typeof screenData.width === 'number' ? Math.max(0, Math.min(screenData.width, 10000)) : null;
      const height = typeof screenData.height === 'number' ? Math.max(0, Math.min(screenData.height, 10000)) : null;
      
      if (width !== null || height !== null) {
        technicalData.screen = { width, height };
      }
    }

    // Get IP geolocation data (non-blocking)
    try {
      geoData = await getIPGeolocation(technicalData.ipAddress);
      technicalData.country = geoData.country;
      technicalData.city = geoData.city;
      technicalData.region = geoData.region;
    } catch {
      // Set default values if geolocation fails
      technicalData.country = 'Unknown';
      technicalData.city = 'Unknown';
      technicalData.region = 'Unknown';
    }
  } catch {
    // Create minimal technical data if extraction fails
    technicalData = {
      ipAddress: req.headers.get("x-forwarded-for")?.split(",")[0] || 'unknown',
      userAgent: req.headers.get("user-agent") || 'unknown',
      browser: { name: 'Unknown', version: 'Unknown' },
      os: { name: 'Unknown', version: 'Unknown' },
      device: { type: 'unknown', isMobile: false, isTablet: false, isDesktop: false },
      screen: screenData || { width: null, height: null },
      language: 'en',
      timezone: 'UTC',
      referrer: req.headers.get("referer") || null,
      timestamp: new Date().toISOString(),
      country: 'Unknown',
      city: 'Unknown',
      region: 'Unknown'
    };
  }

  // First, try to save the email and technical data to Supabase
  const { data: dbData, error: dbError } = await supabaseAdmin
    .from('waitlist')
    .insert([
      { 
        email: sanitizedEmail,
        // Structured columns for easy querying (with fallbacks)
        ip_address: technicalData.ipAddress || 'unknown',
        country: technicalData.country || 'Unknown',
        city: technicalData.city || 'Unknown',
        region: technicalData.region || 'Unknown',
        device_type: technicalData.device?.type || 'unknown',
        browser_name: technicalData.browser?.name || 'Unknown',
        browser_version: technicalData.browser?.version || 'Unknown',
        os_name: technicalData.os?.name || 'Unknown',
        os_version: technicalData.os?.version || 'Unknown',
        screen_width: technicalData.screen?.width || null,
        screen_height: technicalData.screen?.height || null,
        language: technicalData.language || 'en',
        timezone: technicalData.timezone || 'UTC',
        referrer: technicalData.referrer || null,
        user_agent: technicalData.userAgent || 'Unknown',
        // Keep full technical data as backup
        technical_data: technicalData
      }
    ])
    .select()
    .single();

  // Handle duplicate email error
  if (dbError) {
    if (dbError.code === '23505') { // PostgreSQL unique constraint violation
      throw Errors.conflict('Email already subscribed');
    }
    throw Errors.internalServerError(`Failed to save email to database: ${dbError.message}`);
  }

  // If database save was successful, send welcome email
  try {
    // Send welcome email to the user
    const emailData = await resend.emails.send({
      from: 'Santelle <waitlist@santellehealth.com>',
      to: sanitizedEmail,
      subject: 'To her health, and now yours ✨',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 640px; margin: 0 auto; padding: 24px; color:#333;">
          <!-- preheader -->
          <span style="display:none; font-size:0; line-height:0; max-height:0; max-width:0; opacity:0; overflow:hidden;">
            You’re on the list. Early access, exclusive insights — and your chance to shape the future of intimate health.
          </span>

          <div style="text-align:center; padding:12px 0 4px;">
            <img src="https://santellehealth.com/logo-dark.svg" alt="Santelle" width="400" height="100" style="border:0; outline:none; text-decoration:none; border-radius:12px;">
          </div>

          <h1 style="color:#721422; text-align:center; margin:8px 0 4px; font-size:28px;">
            Welcome to <span style="font-style:italic;">Santelle</span> 💗
          </h1>

          <p style="font-size:18px; line-height:1.6; margin:12px 0;">
            Hi! Thanks for joining the <strong>Santelle waitlist</strong>! You’re officially first in line for a new way to
            check in on your intimate health — discreetly, from home, with science-backed insights (way beyond pH).
          </p>

          <div style="background:#fff5f6; border:1px solid #f3d7db; padding:20px; border-radius:14px; margin:20px 0;">
            <h3 style="color:#721422; margin:0 0 8px; font-size:18px;">What’s next?</h3>
            <p style="margin:8px 0 0; font-size:16px; color:#555; line-height:1.6;">
              You’ll receive exclusive updates as we prepare for launch, plus early access to our self-check kits and
              community insights designed to empower you with knowledge, confidence, and connection.
            </p>
          </div>

          <div style="background:#721422; color:white; padding:24px; border-radius:14px; margin:24px 0; text-align:center;">
            <h3 style="color:white; margin:0 0 16px; font-size:20px;">🌸 Personalize Your Experience</h3>
            <p style="margin:0 0 20px; font-size:16px; line-height:1.6;">
              Complete your profile (just your name and location) and become part of our founding community. 
              You’ll unlock region-specific updates, personalized insights, and exclusive first access before our public launch. 
              Plus, completing your profile helps shape the future of intimate health for all women.
            </p>
            <a href="https://santellehealth.com/complete-profile?email=${sanitizedEmail}" 
              style="background:#ff4fa3; color:white; padding:16px 32px; text-decoration:none; border-radius:999px; font-weight:bold; display:inline-block;">
              Complete My Profile
            </a>
          </div>

          <hr style="border:none; border-top:1px solid #f0e0e3; margin:24px 0;">

          <p style="font-size:13px; color:#888; text-align:center; margin:28px 0 0;">
            To Her Health,<br>
            The Santelle Team
          </p>

          <!-- Update the unsubscribe section -->
          <p style="font-size:12px; color:#aaa; text-align:center; margin-top:12px;">
            You're receiving this because you signed up at santellehealth.com. <br>
            <a href="https://santellehealth.com/unsubscribe?email=${sanitizedEmail}" style="color:#721422; text-decoration:underline;">Unsubscribe</a> | 
            <a href="https://santellehealth.com/complete-profile?email=${sanitizedEmail}" style="color:#721422; text-decoration:underline;">Update Profile</a> | 
            <a href="https://santellehealth.com/resubscribe?email=${sanitizedEmail}" style="color:#721422; text-decoration:underline;">Resubscribe</a>
          </p>
        </div>
      `
      });

    // Send notification email to gabrielkotovsky@hotmail.com
    await resend.emails.send({
      from: 'Santelle <waitlist@santellehealth.com>',
      to: 'gabrielkotovsky@hotmail.com',
      subject: 'New Waitlist Signup - Santelle',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #721422; text-align: center;">New Waitlist Signup</h2>
          <p style="font-size: 16px; color: #333; line-height: 1.6;">
            Someone has joined the Santelle waitlist!
          </p>
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 10px; margin: 20px 0;">
            <h3 style="color: #721422; margin-top: 0;">Signup Details</h3>
            <p style="color: #666; margin: 0;">
              <strong>Email:</strong> ${sanitizedEmail}
            </p>
            <p style="color: #666; margin: 0;">
              <strong>Time:</strong> ${new Date().toLocaleString()}
            </p>
            <p style="color: #666; margin: 0;">
              <strong>IP Address:</strong> ${technicalData.ipAddress}
            </p>
            <p style="color: #666; margin: 0;">
              <strong>Location:</strong> ${technicalData.country || 'Unknown'}${technicalData.city ? `, ${technicalData.city}` : ''}${technicalData.region ? `, ${technicalData.region}` : ''}
            </p>
            <p style="color: #666; margin: 0;">
              <strong>Timezone:</strong> ${technicalData.timezone}
            </p>
            <p style="color: #666; margin: 0;">
              <strong>Device:</strong> ${technicalData.device.type} (${technicalData.os.name} ${technicalData.os.version})
            </p>
            <p style="color: #666; margin: 0;">
              <strong>Browser:</strong> ${technicalData.browser.name} ${technicalData.browser.version}
            </p>
            <p style="color: #666; margin: 0;">
              <strong>Language:</strong> ${technicalData.language}
            </p>
            ${technicalData.referrer ? `<p style="color: #666; margin: 0;"><strong>Referrer:</strong> ${technicalData.referrer}</p>` : ''}
          </div>
          <p style="font-size: 14px; color: #999; text-align: center; margin-top: 30px;">
            This is an automated notification from the Santelle waitlist system.
          </p>
        </div>
      `
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Successfully subscribed to waitlist',
      data: { dbData, emailData }
    });

  } catch {
    // Even if email fails, we still saved to database, so return success
    return NextResponse.json({ 
      success: true, 
      message: 'Successfully subscribed to waitlist (email delivery may be delayed)',
      data: { dbData },
      warning: 'Email delivery failed'
    });
  }
}

export const POST = withErrorHandler(subscribeHandler); 