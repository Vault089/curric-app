// @ts-nocheck
'use server'

import { createClient } from '@/utils/supabase/server'
import { getURL } from '@/utils/helpers'

function isValidEmail(email: string) {
  const regex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/
  return regex.test(email)
}

export async function signupTeacher(formData: FormData) {
  const name = String(formData.get('name') || '').trim()
  const email = String(formData.get('email') || '').trim()
  const password = String(formData.get('password') || '').trim()
  const confirmPassword = String(formData.get('confirmPassword') || '').trim()

  // ── Validation ──────────────────────────────────────────────────────────
  if (!name) {
    return { error: 'Please enter your full name.' }
  }

  if (!email) {
    return { error: 'Please enter your email address.' }
  }

  if (!isValidEmail(email)) {
    return { error: 'Please enter a valid email address.' }
  }

  if (!password) {
    return { error: 'Please enter a password.' }
  }

  if (password.length < 6) {
    return { error: 'Password must be at least 6 characters long.' }
  }

  if (password !== confirmPassword) {
    return { error: 'Passwords do not match.' }
  }

  // ── Supabase Auth ───────────────────────────────────────────────────────
  const supabase = createClient() as any
  const callbackURL = getURL('/auth/callback')

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: callbackURL,
      data: {
        full_name: name,
        role: 'teacher'
      }
    }
  })

  if (error) {
    // Surface friendly messages for common errors
    const msg = error.message.toLowerCase()
    if (msg.includes('already registered') || msg.includes('already been registered')) {
      return {
        error:
          'An account with this email already exists. Try signing in instead.'
      }
    }
    if (msg.includes('password should') || msg.includes('password too')) {
      return {
        error: 'Password is too weak. Please choose a stronger password.'
      }
    }
    return { error: error.message }
  }

  // Supabase returns empty identities when the email is already taken
  if (
    data.user &&
    data.user.identities &&
    data.user.identities.length === 0
  ) {
    return {
      error:
        'An account with this email already exists. Try signing in instead.'
    }
  }

  // ── Create profile rows ─────────────────────────────────────────────────
  if (data.user) {
    // Upsert into the users table (matches existing trigger / pattern)
    await supabase
      .from('users')
      .upsert({
        id: data.user.id,
        full_name: name,
        role: 'teacher'
      })
      .select()

    // Insert into teacher_profiles
    const { error: profileError } = await supabase
      .from('teacher_profiles')
      .insert({
        id: data.user.id,
        full_name: name,
        email: email
      })

    if (profileError) {
      console.error('Error creating teacher profile:', profileError)
      // Non-fatal — user can complete profile from dashboard
    }
  }

  // ── Determine redirect ──────────────────────────────────────────────────
  if (data.session) {
    // Auto-signed-in (email confirmation disabled)
    return { success: true, redirect: '/dashboard/profile' }
  }

  if (data.user) {
    // Email confirmation required
    return {
      success: true,
      message:
        'Please check your email for a confirmation link. You may now close this tab.'
    }
  }

  return { error: 'Something went wrong. Please try again.' }
}
