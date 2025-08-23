import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { supabaseAdmin } from '@/lib/supabase';
import { extractTechnicalData } from '@/lib/technicalData';

const resend = new Resend(process.env.RESEND_API_KEY!);

export async function POST(req: NextRequest) {
  try {
    const { email, screenData } = await req.json();

    // Debug: Check environment variables
    console.log('Supabase URL exists:', !!process.env.NEXT_PUBLIC_SUPABASE_URL);
    console.log('Supabase Service Key exists:', !!process.env.SUPABASE_SERVICE_ROLE_KEY);
    console.log('Email received:', email);

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email is required' },
        { status: 400 }
      );
    }

    // Extract technical data from the request
    const technicalData = extractTechnicalData(req);
    
    // Merge screen data from client if provided
    if (screenData) {
      technicalData.screen = screenData;
    }

    // Print detailed technical data to console
    console.log('=== TECHNICAL DATA COLLECTED ===');
    console.log('📧 Email:', email);
    console.log('🌐 IP Address:', technicalData.ipAddress);
    console.log('🕒 Timestamp:', technicalData.timestamp);
    console.log('🖥️  Device Type:', technicalData.device.type);
    console.log('📱 Is Mobile:', technicalData.device.isMobile);
    console.log('🖱️  Is Desktop:', technicalData.device.isDesktop);
    console.log('🌐 Browser:', `${technicalData.browser.name} ${technicalData.browser.version}`);
    console.log('💻 OS:', `${technicalData.os.name} ${technicalData.os.version}`);
    console.log('📏 Screen:', `${technicalData.screen.width}x${technicalData.screen.height}`);
    console.log('🌍 Language:', technicalData.language);
    console.log('⏰ Timezone:', technicalData.timezone);
    console.log('🔗 Referrer:', technicalData.referrer || 'Direct visit');
    console.log('🖥️  User Agent:', technicalData.userAgent);
    console.log('================================');

    // First, try to save the email and technical data to Supabase
    const { data: dbData, error: dbError } = await supabaseAdmin
      .from('waitlist')
      .insert([
        { 
          email: email.toLowerCase().trim(),
          technical_data: technicalData
        }
      ])
      .select()
      .single();

    // Handle duplicate email error
    if (dbError) {
      console.error('Database error details:', dbError);
      if (dbError.code === '23505') { // PostgreSQL unique constraint violation
        return NextResponse.json(
          { success: false, error: 'Email already subscribed' },
          { status: 409 }
        );
      }
      return NextResponse.json(
        { success: false, error: `Failed to save email to database: ${dbError.message}` },
        { status: 500 }
      );
    }

    // If database save was successful, send welcome email
    try {
      // Send welcome email to the user
      const emailData = await resend.emails.send({
        from: 'Santelle <waitlist@santellehealth.com>',
        to: email,
        subject: 'To her health, and now yours ✨',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 640px; margin: 0 auto; padding: 24px; color:#333;">
            <!-- preheader -->
            <span style="display:none; font-size:0; line-height:0; max-height:0; max-width:0; opacity:0; overflow:hidden;">
              You’re on the list. Early access, exclusive updates — and a chance to be one of 50 beta testers.
            </span>
      
            <div style="text-align:center; padding:12px 0 4px;">
              <img src="https://santellehealth.com/logo-dark.svg" alt="Santelle" width="400" height="100" style="border:0; outline:none; text-decoration:none; border-radius:12px;">
            </div>
      
            <h1 style="color:#721422; text-align:center; margin:8px 0 4px; font-size:28px;">
              Welcome to <span style="font-style:italic;">Santelle</span> 💜
            </h1>
      
            <p style="font-size:18px; line-height:1.6; margin:12px 0;">
              Hi! Thanks for joining the <strong>Santelle waitlist</strong>! You’re officially first in line for a new way to
              check in on your intimate health — discreetly, from home, with science-backed insights (way beyond pH).
            </p>
      
            <div style="background:#fff5f6; border:1px solid #f3d7db; padding:20px; border-radius:14px; margin:20px 0;">
              <h3 style="color:#721422; margin:0 0 8px; font-size:18px;">What’s next?</h3>
              <ul style="padding-left:18px; margin:0; font-size:16px; color:#555; line-height:1.7;">
                <li>Early access alerts as we get closer to launch</li>
                <li>Exclusive tips on vaginal health, straight to your inbox</li>
                <li>Invites to community polls so you can help shape the product</li>
              </ul>
            </div>
      
            <div style="background:#fef7fa; border:1px dashed #e6b7c0; padding:18px; border-radius:14px; margin:20px 0;">
              <h3 style="color:#721422; margin:0 0 6px; font-size:18px;">Be one of our 50 beta testers</h3>
              <p style="margin:8px 0 0; font-size:16px; color:#555; line-height:1.6;">
                We’re selecting <strong>50 people</strong> from this waitlist to try Santelle first, give feedback, and help us polish the experience.
                Keep an eye out for an email from us soon!
              </p>
            </div>
      
            <hr style="border:none; border-top:1px solid #f0e0e3; margin:24px 0;">
      
            <p style="font-size:13px; color:#888; text-align:center; margin:28px 0 0;">
              To Her Health,<br>
              The Santelle Team
            </p>
      
            <p style="font-size:12px; color:#aaa; text-align:center; margin-top:12px;">
              You’re receiving this because you signed up at santellehealth.com. <br>
              Prefer fewer emails? <a href="{{UNSUBSCRIBE_LINK}}" style="color:#721422; text-decoration:underline;">Unsubscribe</a>.
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
                <strong>Email:</strong> ${email}
              </p>
              <p style="color: #666; margin: 0;">
                <strong>Time:</strong> ${new Date().toLocaleString()}
              </p>
              <p style="color: #666; margin: 0;">
                <strong>IP Address:</strong> ${technicalData.ipAddress}
              </p>
              <p style="color: #666; margin: 0;">
                <strong>Location:</strong> ${technicalData.timezone}
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

    } catch (emailError) {
      console.error('Email sending error:', emailError);
      // Even if email fails, we still saved to database, so return success
      return NextResponse.json({ 
        success: true, 
        message: 'Successfully subscribed to waitlist (email delivery may be delayed)',
        data: { dbData },
        warning: 'Email delivery failed'
      });
    }

  } catch (error) {
    console.error('Subscribe error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process subscription' },
      { status: 500 }
    );
  }
} 