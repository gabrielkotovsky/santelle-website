import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { withErrorHandler, Errors } from '@/middleware/errorHandler';

async function collectAdditionalInfoHandler(req: NextRequest) {
  if (req.method !== 'POST') {
    return NextResponse.json(
      { success: false, error: 'Method not allowed' },
      { status: 405 }
    );
  }

  try {
    const body = await req.json();
    const { email, firstName, lastName, source } = body;

    // Validate required fields
    if (!email || !firstName || !lastName) {
      throw Errors.validation('Email, first name, and last name are required');
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw Errors.validation('Invalid email format');
    }

    // Sanitize inputs (basic sanitization)
    const sanitizedEmail = email.trim().toLowerCase();
    const sanitizedFirstName = firstName.trim().substring(0, 100);
    const sanitizedLastName = lastName.trim().substring(0, 100);
    const sanitizedSource = source ? source.trim().substring(0, 255) : null;

    // Update the waitlist entry
    const { error } = await supabaseAdmin
      .from('waitlist')
      .update({
        first_name: sanitizedFirstName,
        last_name: sanitizedLastName,
        source: sanitizedSource,
        additional_data_collected: true
      })
      .eq('email', sanitizedEmail)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No rows found
        throw Errors.notFound('Email not found in waitlist');
      }
      throw Errors.internalServerError(`Failed to update waitlist: ${error.message}`);
    }

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully! You now have higher priority for beta testing.',
      data: {
        email: sanitizedEmail,
        firstName: sanitizedFirstName,
        lastName: sanitizedLastName,
        source: sanitizedSource
      }
    });

  } catch (error) {
    if (error instanceof Error && error.message.includes('Unexpected token')) {
      throw Errors.validation('Invalid JSON in request body');
    }
    throw error;
  }
}

export const POST = withErrorHandler(collectAdditionalInfoHandler);
