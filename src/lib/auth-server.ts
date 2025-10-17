import { getSupabaseAdmin } from './supabase';

// Server-side auth utilities that require admin access
// These should only be used in API routes or server components

export async function needsOnboarding(userId: string): Promise<boolean> {
    const supabaseAdmin = getSupabaseAdmin();
    
    // Check if user has completed onboarding by querying the onboarding_responses table
    const { data, error } = await supabaseAdmin
        .from('onboarding_responses')
        .select('onboarding_complete')
        .eq('user_id', userId)
        .single();
    
    // If no record exists or onboarding is not complete, user needs onboarding
    if (error || !data) {
        return true;
    }
    
    return !data.onboarding_complete;
}

export async function needsQuestionnaire(userId: string): Promise<boolean> {
    const supabaseAdmin = getSupabaseAdmin();
    
    // Check if user has completed all questionnaire questions
    const isComplete = await hasCompletedQuestionnaire(userId);
    return !isComplete;
}

export async function getUserNavigationRoute(userId: string): Promise<string> {
    try {
        if (!userId) return '/';
        
        // Check onboarding status first
        const needsOnboardingFlow = await needsOnboarding(userId);
        if (needsOnboardingFlow) {
            return '/complete-profile';
        }
        
        // Check questionnaire status
        const needsQuestionnaireFlow = await needsQuestionnaire(userId);
        if (needsQuestionnaireFlow) {
            return '/quiz';
        }
        
        // Both complete, go to home
        return '/';
    } catch (error: any) {
        // If user doesn't exist or any error, return to home
        return '/';
    }
}

// Onboarding database functions
export async function createOnboardingResponse(userId: string, displayName: string, email: string) {
    const supabaseAdmin = getSupabaseAdmin();
    
    const { data, error } = await supabaseAdmin
        .from('onboarding_responses')
        .insert({
            user_id: userId,
            display_name: displayName,
            email: email,
            onboarding_complete: false
        })
        .select()
        .single();
    
    if (error) throw error;
    return data;
}

export async function updateOnboardingResponse(userId: string, updates: Partial<{
    display_name: string;
    date_of_birth: string;
    country: string;
    terms_accepted: boolean;
    privacy_accepted: boolean;
    marketing_consent: boolean;
    contact_method: string;
    language: string;
    onboarding_complete: boolean;
}>) {
    const supabaseAdmin = getSupabaseAdmin();
    
    const { data, error } = await supabaseAdmin
        .from('onboarding_responses')
        .update({
            ...updates,
            updated_at: new Date().toISOString(),
            ...(updates.onboarding_complete && { completed_at: new Date().toISOString() })
        })
        .eq('user_id', userId)
        .select()
        .single();
    
    if (error) throw error;
    return data;
}

export async function getOnboardingResponse(userId: string) {
    const supabaseAdmin = getSupabaseAdmin();
    
    const { data, error } = await supabaseAdmin
        .from('onboarding_responses')
        .select('*')
        .eq('user_id', userId)
        .single();
    
    if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
        throw error;
    }
    
    return data;
}

export async function getUserDisplayName(userId: string): Promise<string | null> {
    const data = await getOnboardingResponse(userId);
    return data?.display_name || null;
}

// Questionnaire database functions
export async function createQuestionnaireEntry(userId: string) {
    const supabaseAdmin = getSupabaseAdmin();
    
    const { data, error } = await supabaseAdmin
        .from('questionnaire')
        .insert({
            user_id: userId,
            questionnaire_complete: false
        })
        .select()
        .single();
    
    if (error) throw error;
    return data;
}

export async function getQuestionnaireEntry(userId: string) {
    const supabaseAdmin = getSupabaseAdmin();
    
    const { data, error } = await supabaseAdmin
        .from('questionnaire')
        .select('*')
        .eq('user_id', userId)
        .single();
    
    if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
        throw error;
    }
    
    return data;
}

export async function saveQuestionnaireAnswer(
    userId: string, 
    questionNumber: number, 
    answerValue: number | number[]
) {
    const supabaseAdmin = getSupabaseAdmin();
    const columnName = `q${questionNumber}`;
    
    const { data, error } = await supabaseAdmin
        .from('questionnaire')
        .update({ [columnName]: answerValue })
        .eq('user_id', userId)
        .select()
        .single();
    
    if (error) throw error;
    return data;
}

export async function markQuestionnaireComplete(userId: string) {
    const supabaseAdmin = getSupabaseAdmin();
    
    const { data, error } = await supabaseAdmin
        .from('questionnaire')
        .update({ questionnaire_complete: true })
        .eq('user_id', userId)
        .select()
        .single();
    
    if (error) throw error;
    return data;
}

export async function hasCompletedQuestionnaire(userId: string): Promise<boolean> {
    const entry = await getQuestionnaireEntry(userId);
    
    if (!entry) return false;
    
    return entry.questionnaire_complete === true;
}
