import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

interface QuizInsertData {
  q1: number | null;
  q2: number | null;
  q3: number | null;
  q4: number | null;
  'signup?': boolean;
  email?: string;
  plan?: string;
}

export async function POST(request: NextRequest) {
  try {
    const { email, answers, signup, plan } = await request.json();

    // Validate required fields (answers is optional for direct waitlist signups)
    // Save quiz answers to database
    const insertData: QuizInsertData = {
      q1: answers?.q1 || null,
      q2: answers?.q2 || null,
      q3: answers?.q3 || null,
      q4: answers?.q4 || null,
      'signup?': signup || false
    };

    // Only add email if provided
    if (email) {
      insertData.email = email;
    }

    // Only add plan if provided
    if (plan) {
      insertData.plan = plan;
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

interface QuizUpdateData {
  email?: string;
  'signup?'?: boolean;
  plan?: string;
}

export async function PUT(request: NextRequest) {
  try {
    const { id, email, signup, plan } = await request.json();

    // Validate required fields (at least ID is required)
    if (!id) {
      return NextResponse.json(
        { error: 'ID is required' },
        { status: 400 }
      );
    }

    // Build update object
    const updateData: QuizUpdateData = {};

    // Add email if provided
    if (email !== undefined) {
      updateData.email = email;
    }

    // Add signup if provided
    if (signup !== undefined) {
      updateData['signup?'] = signup;
    }

    // Add plan if provided
    if (plan !== undefined) {
      updateData.plan = plan;
    }

    // Update quiz record
    const { data, error } = await supabaseAdmin
      .from('quiz')
      .update(updateData)
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

