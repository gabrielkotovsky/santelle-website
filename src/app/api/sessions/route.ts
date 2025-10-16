import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { extractTechnicalData, getIPGeolocation } from '@/lib/technicalData';

/**
 * POST /api/sessions
 * Create a new session
 */
export async function POST(request: NextRequest) {
  try {
    console.log('[API /api/sessions POST] Received request');
    
    const body = await request.json();
    const { session_id, uid, referrer } = body;

    console.log('[API /api/sessions POST] Request body:', { session_id, uid, referrer });

    // Validate required fields
    if (!session_id || !uid) {
      console.error('[API /api/sessions POST] Missing required fields');
      return NextResponse.json(
        { error: 'session_id and uid are required' },
        { status: 400 }
      );
    }

    // Extract technical data from request
    const technicalData = extractTechnicalData(request);
    console.log('[API /api/sessions POST] Technical data:', {
      device: technicalData.device.type,
      ipAddress: technicalData.ipAddress
    });
    
    // Get country from IP geolocation
    let country = 'Unknown';
    try {
      const geoData = await getIPGeolocation(technicalData.ipAddress);
      country = geoData.country || 'Unknown';
      console.log('[API /api/sessions POST] Geolocation:', country);
    } catch (error) {
      console.error('[API /api/sessions POST] Geolocation error:', error);
    }

    // Get device type from technical data
    const device = technicalData.device.type;

    const sessionData = {
      session_id,
      uid,
      country,
      device,
      referrer: referrer || null,
      started_at: new Date().toISOString(),
      ended_at: null
    };

    console.log('[API /api/sessions POST] Inserting session data:', sessionData);

    // Insert session into database
    const { data, error } = await supabaseAdmin
      .from('web_sessions')
      .insert([sessionData])
      .select();

    if (error) {
      console.error('[API /api/sessions POST] Supabase error:', error);
      return NextResponse.json(
        { error: 'Failed to create session', details: error.message },
        { status: 500 }
      );
    }

    console.log('[API /api/sessions POST] Successfully created session:', data);

    return NextResponse.json({ 
      success: true, 
      data: data[0] 
    });
  } catch (error) {
    console.error('[API /api/sessions POST] Session creation error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/sessions
 * Update session end time
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { session_id } = body;

    // Validate required fields
    if (!session_id) {
      return NextResponse.json(
        { error: 'session_id is required' },
        { status: 400 }
      );
    }

    // Update session end time
    const { data, error } = await supabaseAdmin
      .from('web_sessions')
      .update({ 
        ended_at: new Date().toISOString() 
      })
      .eq('session_id', session_id)
      .select();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: 'Failed to update session' },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      data: data[0] 
    });
  } catch (error) {
    console.error('Session update error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

