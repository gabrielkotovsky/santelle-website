import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { withErrorHandler, Errors } from '@/middleware/errorHandler';

async function unsubscribeHandler(req: NextRequest) {
  if (req.method !== 'POST') {
    return NextResponse.json(
      { success: false, error: 'Method not allowed' },
      { status: 405 }
    );
  }

  try {
    const body = await req.json();
    const { email } = body;

    // Validate email
    if (!email) {
      throw Errors.validation('Email is required');
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw Errors.validation('Invalid email format');
    }

    const sanitizedEmail = email.trim().toLowerCase();

    // Update the waitlist entry to mark as unsubscribed
    const supabaseAdmin = getSupabaseAdmin();
    const { error } = await supabaseAdmin
      .from('waitlist')
      .update({
        unsubscribed_at: new Date().toISOString(),
        mailing: false
      })
      .eq('email', sanitizedEmail)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No rows found
        throw Errors.notFound('Email not found in waitlist');
      }
      throw Errors.internalServerError(`Failed to unsubscribe: ${error.message}`);
    }

    return NextResponse.json({
      success: true,
      message: 'Successfully unsubscribed from waitlist emails',
      data: {
        email: sanitizedEmail,
        unsubscribed_at: new Date().toISOString()
      }
    });

  } catch (error) {
    if (error instanceof Error && error.message.includes('Unexpected token')) {
      throw Errors.validation('Invalid JSON in request body');
    }
    throw error;
  }
}

export const POST = withErrorHandler(unsubscribeHandler);
