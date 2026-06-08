'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export type JobFormData = {
  title: string
  description: string
  country: string
  city: string
  job_type: string
  subject: string
  grade_level: string
  salary_min: string
  salary_max: string
  min_experience: string
  required_education: string
  start_date: string
  application_deadline: string
  status: string
}

export async function createJobListing(formData: JobFormData) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  // Check if user has a school profile
  const { data: school } = await supabase
    .from('school_profiles')
    .select('id')
    .eq('id', user.id)
    .single()

  if (!school) {
    return { error: 'No school profile found. Please create one first.' }
  }

  const { error } = await supabase.from('job_listings').insert({
    school_id: user.id,
    title: formData.title,
    description: formData.description,
    country: formData.country,
    city: formData.city || null,
    job_type: formData.job_type,
    subject: formData.subject || null,
    grade_level: formData.grade_level || null,
    salary_min: formData.salary_min ? parseInt(formData.salary_min) : null,
    salary_max: formData.salary_max ? parseInt(formData.salary_max) : null,
    salary_currency: 'USD',
    min_experience: formData.min_experience ? parseInt(formData.min_experience) : null,
    required_education: formData.required_education || null,
    start_date: formData.start_date || null,
    application_deadline: formData.application_deadline || null,
    status: formData.status || 'draft',
  })

  if (error) {
    console.error('Error creating job listing:', error)
    return { error: error.message }
  }

  revalidatePath('/dashboard/jobs')
  revalidatePath('/jobs')
  return { success: true }
}

export async function updateJobStatus(jobId: string, status: string) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  const { error } = await supabase
    .from('job_listings')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', jobId)
    .eq('school_id', user.id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard/jobs')
  revalidatePath('/jobs')
  revalidatePath(`/jobs/${jobId}`)
  return { success: true }
}

export async function deleteJobListing(jobId: string) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  const { error } = await supabase
    .from('job_listings')
    .delete()
    .eq('id', jobId)
    .eq('school_id', user.id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard/jobs')
  revalidatePath('/jobs')
  return { success: true }
}

export async function toggleSaveJob(jobId: string) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  // Check if already saved
  const { data: existing } = await supabase
    .from('saved_jobs')
    .select('id')
    .eq('teacher_id', user.id)
    .eq('job_id', jobId)
    .single()

  if (existing) {
    // Unsave
    const { error } = await supabase
      .from('saved_jobs')
      .delete()
      .eq('id', existing.id)

    if (error) return { error: error.message }
    return { saved: false }
  } else {
    // Save
    const { error } = await supabase
      .from('saved_jobs')
      .insert({ teacher_id: user.id, job_id: jobId })

    if (error) return { error: error.message }
    return { saved: true }
  }
}
