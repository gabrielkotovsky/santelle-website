import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { supabaseAdmin } from '@/lib/supabase';

const resend = new Resend(process.env.RESEND_API_KEY!);

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

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

    // First, try to save the email to Supabase
    const { data: dbData, error: dbError } = await supabaseAdmin
      .from('waitlist')
      .insert([
        { 
          email: email.toLowerCase().trim()
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
      const emailData = await resend.emails.send({
        from: 'Santelle <waitlist@santellehealth.com>',
        to: email,
        subject: 'Welcome to the Santelle Waitlist! 🎉',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #721422; text-align: center;">Welcome to Santelle!</h1>
            <p style="font-size: 18px; color: #333; line-height: 1.6;">
              Thank you for joining the <strong>Santelle waitlist</strong>! 🎉
            </p>
            <p style="font-size: 16px; color: #666; line-height: 1.6;">
              We're excited to have you on board as we work to revolutionize vaginal health monitoring. 
              You'll be among the first to know when we launch and get early access to our innovative at-home testing kit.
            </p>
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 10px; margin: 20px 0;">
              <h3 style="color: #721422; margin-top: 0;">What's Next?</h3>
              <ul style="color: #666;">
                <li>We'll keep you updated on our progress</li>
                <li>You'll get early access when we launch</li>
                <li>Exclusive insights into vaginal health</li>
              </ul>
            </div>
            <p style="font-size: 14px; color: #999; text-align: center; margin-top: 30px;">
              To Her Health,<br>
              The Santelle Team
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