import { createClient } from '@/utils/supabase/server'
import { getUser } from '@/utils/supabase/queries'
import { redirect } from 'next/navigation'
import { CreateJobForm } from './create-job-form'

export default async function NewJobPage() {
  const supabase = createClient()
  const user = await getUser(supabase)

  if (!user) {
    return redirect('/signin')
  }

  // Verify user has a school profile
  const { data: school } = await supabase
    .from('school_profiles')
    .select('id, org_name')
    .eq('id', user.id)
    .single()

  if (!school) {
    return redirect('/dashboard')
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40 gap-4 p-4 md:p-8">
      <div className="mb-2">
        <h1 className="text-2xl font-bold tracking-tight">Post a New Job</h1>
        <p className="text-muted-foreground">
          Fill in the details to create a new job listing at {school.org_name}
        </p>
      </div>
      <CreateJobForm />
    </div>
  )
}
