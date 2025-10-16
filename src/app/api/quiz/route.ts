import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { email, answers, signup } = await request.json();

    // Validate required fields (email is optional for initial save)
    if (!answers) {
      return NextResponse.json(
        { error: 'Answers are required' },
        { status: 400 }
      );
    }

    // Save quiz answers to database
    const insertData: any = {
      q1: answers.q1,
      q2: answers.q2,
      q3: answers.q3,
      q4: answers.q4,
      'signup?': signup || false
    };

    // Only add email if provided
    if (email) {
      insertData.email = email;
    }

    const { data, error } = await supabaseAdmin
      .from('quiz')
      .insert([insertData])
      .select();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: 'Failed to save quiz answers' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Quiz submission error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { id, email, signup } = await request.json();

    // Validate required fields
    if (!id || !email) {
      return NextResponse.json(
        { error: 'ID and email are required' },
        { status: 400 }
      );
    }

    // Update quiz record with email and signup status
    const { data, error } = await supabaseAdmin
      .from('quiz')
      .update({
        email: email,
        'signup?': signup || false
      })
      .eq('id', id)
      .select();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: 'Failed to update quiz record' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Quiz update error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

