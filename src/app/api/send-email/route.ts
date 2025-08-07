import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY!);

export async function POST(req: NextRequest) {
  try {
    const { to, subject, html } = await req.json();

    const data = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: to || 'gabrielkotovsky@hotmail.com',
      subject: subject || 'Welcome to Santelle Waitlist!',
      html: html || '<p>Thank you for joining the <strong>Santelle waitlist</strong>! We\'ll keep you updated on our progress.</p>'
    });

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Email sending error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to send email' }, 
      { status: 500 }
    );
  }
} 