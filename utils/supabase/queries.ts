import { SupabaseClient } from '@supabase/supabase-js';
import { cache } from 'react';
import { Database } from '@/types/db';

export const getUser = cache(async (supabase: SupabaseClient<Database, 'public', any>) => {
  const {
    data: { user }
  } = await supabase.auth.getUser();
  return user;
});

export const getSubscription = cache(async (supabase: SupabaseClient<Database, 'public', any>, userId: string) => {
  const { data: subscription, error: subscriptionError } = await supabase
    .from('subscriptions')
    .select(`
      *,
      prices (
        *,
        products (*)
      )
    `)
    .eq('user_id', userId)
    .in('status', ['trialing', 'active'])
    .maybeSingle();

  if (subscriptionError) {
    console.error('Error fetching subscription:', subscriptionError);
    return null;
  }

  return subscription;
});

export const getProducts = cache(async (supabase: SupabaseClient) => {
  const { data: products, error } = await supabase
    .from('products')
    .select('*, prices(*)')
    .eq('active', true)
    .eq('prices.active', true)
    .order('metadata->index')
    .order('unit_amount', { referencedTable: 'prices' });

  return products;
});

export const getPlans = cache(async (supabase: SupabaseClient) => {
  const { data: plans, error } = await supabase
    .from('plan')
    .select('*')
    .order('sort', { ascending: true })
    .order('id', { ascending: true });

  if (error) {
    console.error('Error fetching plans:', error);
    throw error;
  }
  return plans;
});

export const getUserDetails = cache(async (supabase: SupabaseClient<any>) => {
  const { data: userDetails } = await supabase
    .from('users')
    .select('*')
    .single();
  return userDetails;
});

// Teacher-specific queries

export const getTeacherProfile = cache(async (supabase: SupabaseClient<Database>, userId: string) => {
  const { data, error } = await supabase
    .from('teacher_profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();

  if (error) {
    console.error('Error fetching teacher profile:', error);
    return null;
  }
  return data;
});

export const getSavedJobsCount = cache(async (supabase: SupabaseClient<Database>, teacherId: string) => {
  const { count, error } = await supabase
    .from('saved_jobs')
    .select('*', { count: 'exact', head: true })
    .eq('teacher_id', teacherId);

  if (error) {
    console.error('Error fetching saved jobs count:', error);
    return 0;
  }
  return count ?? 0;
});

export const getApplicationsCount = cache(async (supabase: SupabaseClient<Database>, teacherId: string) => {
  const { count, error } = await supabase
    .from('applications')
    .select('*', { count: 'exact', head: true })
    .eq('teacher_id', teacherId);

  if (error) {
    console.error('Error fetching applications count:', error);
    return 0;
  }
  return count ?? 0;
});

export const getRecentJobs = cache(async (supabase: SupabaseClient<Database>, limit: number = 4) => {
  const { data, error } = await supabase
    .from('job_listings')
    .select(`
      *,
      school_profiles (org_name, logo_url, country, city)
    `)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching recent jobs:', error);
    return [];
  }
  return data;
});
