import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
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
    const { email, firstName, source, age_range, interest, purchasing_intent, communication_channel } = body;

    // Validate required fields
    if (!email || !firstName) {
      throw Errors.validation('Email and first name are required');
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw Errors.validation('Invalid email format');
    }

    // Sanitize inputs (basic sanitization)
    const sanitizedEmail = email.trim().toLowerCase();
    const sanitizedFirstName = firstName.trim().substring(0, 100);
    const sanitizedSource = source ? source.trim().substring(0, 255) : null;
    const sanitizedAgeRange = age_range ? age_range.trim().substring(0, 50) : null;
    const sanitizedInterest = interest ? interest.trim().substring(0, 100) : null;
    const sanitizedPurchasingIntent = purchasing_intent ? purchasing_intent.trim().substring(0, 100) : null;
    const sanitizedCommunicationChannel = communication_channel ? communication_channel.trim().substring(0, 50) : null;

    // Update the waitlist entry
    const supabaseAdmin = getSupabaseAdmin();
    const { error } = await supabaseAdmin
      .from('waitlist')
      .update({
        first_name: sanitizedFirstName,
        source: sanitizedSource,
        age_range: sanitizedAgeRange,
        interest: sanitizedInterest,
        purchasing_intent: sanitizedPurchasingIntent,
        communication_channel: sanitizedCommunicationChannel,
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
        source: sanitizedSource,
        age_range: sanitizedAgeRange,
        interest: sanitizedInterest,
        purchasing_intent: sanitizedPurchasingIntent,
        communication_channel: sanitizedCommunicationChannel
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
