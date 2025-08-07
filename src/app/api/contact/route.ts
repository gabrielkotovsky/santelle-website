import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY!);

export async function POST(req: NextRequest) {
  try {
    const { name, email, subject, message, updates } = await req.json();

    await resend.emails.send({
      from: 'onboarding@resend.dev', // or your verified sender
      to: 'gabrielkotovsky@hotmail.com',         // your destination email
      subject: subject || 'New Contact Form Submission',
      html: `
        <h2>New Contact Form Submission</h2>
        <p><b>Name:</b> ${name || '(not provided)'}</p>
        <p><b>Email:</b> ${email}</p>
        <p><b>Subject:</b> ${subject || '(not provided)'}</p>
        <p><b>Wants Updates:</b> ${updates ? 'Yes' : 'No'}</p>
        <p><b>Message:</b><br/>${message}</p>
      `
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to send message.' }, { status: 500 });
  }
} 