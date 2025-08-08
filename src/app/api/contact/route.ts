import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY!);

export async function POST(req: NextRequest) {
  try {
    const { name, email, subject, message, updates } = await req.json();

    // Send email to gabrielkotovsky with the inquiry details
    await resend.emails.send({
      from: 'Santelle <contact@santellehealth.com>',
      to: 'gabrielkotovsky@hotmail.com',
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

    // Send confirmation email to the person who submitted the form
    await resend.emails.send({
      from: 'Santelle <contact@santellehealth.com>',
      to: email,
      subject: 'Thank you for contacting Santelle Health',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #721422; text-align: center;">Thank You for Contacting Us!</h1>
          <p style="font-size: 18px; color: #333; line-height: 1.6;">
            Dear ${name || 'there'},
          </p>
          <p style="font-size: 16px; color: #666; line-height: 1.6;">
            Thank you for reaching out to Santelle Health! We have received your inquiry and appreciate you taking the time to contact us.
          </p>
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 10px; margin: 20px 0;">
            <h3 style="color: #721422; margin-top: 0;">What's Next?</h3>
            <ul style="color: #666;">
              <li>Our team will review your message within 24-48 hours</li>
              <li>We'll respond to your inquiry as soon as possible</li>
              <li>If you requested updates, we'll keep you informed about our progress</li>
            </ul>
          </div>
          <p style="font-size: 16px; color: #666; line-height: 1.6;">
            In the meantime, feel free to explore our website to learn more about our mission to revolutionize vaginal health monitoring.
          </p>
          <p style="font-size: 14px; color: #999; text-align: center; margin-top: 30px;">
            To Her Health,<br>
            The Santelle Team
          </p>
        </div>
      `
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Contact form error:', error);
    return NextResponse.json({ success: false, error: 'Failed to send message.' }, { status: 500 });
  }
} 