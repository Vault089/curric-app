import { createClient } from '@/utils/supabase/server'
import { getUser } from '@/utils/supabase/queries'
import { redirect } from 'next/navigation'
import ProfileEditor from './profile-editor'

export default async function DashboardProfilePage() {
  const supabase = createClient() as any
  const user = await getUser(supabase)

  if (!user) {
    return redirect('/signin')
  }

  // Fetch or create the teacher profile
  let { data: profile, error } = await supabase
    .from('teacher_profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (error || !profile) {
    // Profile doesn't exist yet — create a placeholder row
    const { error: insertError } = await supabase
      .from('teacher_profiles')
      .insert({
        id: user.id,
        full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Teacher',
        email: user.email || '',
        is_public: true,
      })

    if (insertError) {
      console.error('Error creating teacher profile:', insertError)
    }

    // Re-fetch the newly created profile
    const { data: newProfile } = await supabase
      .from('teacher_profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    profile = newProfile
  }

  if (!profile) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-muted-foreground">
          Unable to load profile. Please try again.
        </p>
      </div>
    )
  }

  return <ProfileEditor profile={profile} />
}
