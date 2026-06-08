// @ts-nocheck
'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export type ProfileFormData = {
  full_name: string
  phone: string
  nationality: string
  current_country: string
  city: string
  bio: string
  highest_education: string
  degree_field: string
  certifications: string
  years_experience: string
  languages: string
  preferred_countries: string
  preferred_job_types: string
  min_salary_usd: string
  video_intro_url: string
  is_public: boolean
}

export async function updateProfile(data: ProfileFormData) {
  const supabase = createClient() as any
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  const parseArrayField = (val: string): string[] => {
    if (!val || !val.trim()) return []
    return val.split(',').map(s => s.trim()).filter(Boolean)
  }

  const { error } = await supabase
    .from('teacher_profiles')
    .update({
      full_name: data.full_name,
      phone: data.phone || null,
      nationality: data.nationality || null,
      current_country: data.current_country || null,
      city: data.city || null,
      bio: data.bio || null,
      highest_education: data.highest_education || null,
      degree_field: data.degree_field || null,
      certifications: parseArrayField(data.certifications),
      years_experience: data.years_experience ? parseInt(data.years_experience) : null,
      languages: parseArrayField(data.languages),
      preferred_countries: parseArrayField(data.preferred_countries),
      preferred_job_types: parseArrayField(data.preferred_job_types),
      min_salary_usd: data.min_salary_usd ? parseInt(data.min_salary_usd) : null,
      video_intro_url: data.video_intro_url || null,
      is_public: data.is_public,
      updated_at: new Date().toISOString(),
    })
    .eq('id', user.id)

  if (error) {
    console.error('Error updating profile:', error)
    return { error: error.message }
  }

  revalidatePath('/dashboard/profile')
  revalidatePath(`/profile/${user.id}`)
  return { success: true }
}

export async function uploadCV(file: File) {
  const supabase = createClient() as any
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated', url: null }
  }

  const fileExt = file.name.split('.').pop()
  const filePath = `${user.id}/cv.${fileExt}`

  const { error } = await supabase.storage
    .from('teacher-docs')
    .upload(filePath, file, { upsert: true })

  if (error) {
    console.error('Error uploading CV:', error)
    return { error: error.message, url: null }
  }

  const { data: { publicUrl } } = supabase.storage
    .from('teacher-docs')
    .getPublicUrl(filePath)

  const urlWithCacheBust = `${publicUrl}?t=${Date.now()}`

  // Update the profile with the new CV URL
  const { error: updateError } = await supabase
    .from('teacher_profiles')
    .update({ cv_url: urlWithCacheBust, updated_at: new Date().toISOString() })
    .eq('id', user.id)

  if (updateError) {
    console.error('Error updating profile with CV URL:', updateError)
  }

  revalidatePath('/dashboard/profile')
  return { url: urlWithCacheBust, error: null }
}

export async function uploadAvatar(file: File) {
  const supabase = createClient() as any
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated', url: null }
  }

  const fileExt = file.name.split('.').pop()
  const filePath = `${user.id}/avatar.${fileExt}`

  const { error } = await supabase.storage
    .from('avatars')
    .upload(filePath, file, { upsert: true })

  if (error) {
    console.error('Error uploading avatar:', error)
    return { error: error.message, url: null }
  }

  const { data: { publicUrl } } = supabase.storage
    .from('avatars')
    .getPublicUrl(filePath)

  const urlWithCacheBust = `${publicUrl}?t=${Date.now()}`

  // Update the profile with the new avatar URL
  const { error: updateError } = await supabase
    .from('teacher_profiles')
    .update({ avatar_url: urlWithCacheBust, updated_at: new Date().toISOString() })
    .eq('id', user.id)

  if (updateError) {
    console.error('Error updating profile with avatar URL:', updateError)
  }

  revalidatePath('/dashboard/profile')
  revalidatePath(`/profile/${user.id}`)
  return { url: urlWithCacheBust, error: null }
}
