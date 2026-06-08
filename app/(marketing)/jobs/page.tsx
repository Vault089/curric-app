import { createClient } from '@/utils/supabase/server'
import { Suspense } from 'react'
import { JobCard } from '@/components/jobs/job-card'
import { JobFilterBar } from '@/components/jobs/job-filter-bar'
import { Briefcase } from 'lucide-react'

type SearchParams = {
  country?: string
  job_type?: string
  subject?: string
  q?: string
}

async function JobListings({ searchParams }: { searchParams: SearchParams }) {
  const supabase = createClient()

  let query = supabase
    .from('job_listings')
    .select(`
      id,
      title,
      country,
      city,
      job_type,
      subject,
      salary_min,
      salary_max,
      salary_currency,
      created_at,
      is_featured,
      school_profiles (org_name, logo_url, is_verified)
    `)
    .eq('status', 'active')
    .order('is_featured', { ascending: false })
    .order('created_at', { ascending: false })

  if (searchParams.country) {
    query = query.eq('country', searchParams.country)
  }
  if (searchParams.job_type) {
    query = query.eq('job_type', searchParams.job_type)
  }
  if (searchParams.subject) {
    query = query.eq('subject', searchParams.subject)
  }
  if (searchParams.q) {
    query = query.ilike('title', `%${searchParams.q}%`)
  }

  const { data: jobs, error } = await query

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Failed to load job listings. Please try again later.</p>
      </div>
    )
  }

  if (!jobs || jobs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <Briefcase className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold">No jobs found</h3>
        <p className="text-muted-foreground mt-1">
          {searchParams.country || searchParams.job_type || searchParams.subject || searchParams.q
            ? 'Try adjusting your filters or search term to find more results.'
            : 'Check back later for new teaching opportunities.'}
        </p>
      </div>
    )
  }

  const hasFilters = searchParams.country || searchParams.job_type || searchParams.subject || searchParams.q

  return (
    <div>
      {hasFilters && (
        <p className="text-sm text-muted-foreground mb-4">
          {jobs.length} {jobs.length === 1 ? 'result' : 'results'} found
        </p>
      )}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {jobs.map((job) => (
          <JobCard key={job.id} job={job as any} />
        ))}
      </div>
    </div>
  )
}

export default async function JobsPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Teaching Jobs</h1>
        <p className="mt-2 text-muted-foreground">
          Find your next teaching position around the world
        </p>
      </div>

      <Suspense fallback={<div className="h-20 animate-pulse rounded-lg bg-muted" />}>
        <div className="mb-6">
          <JobFilterBar />
        </div>
      </Suspense>

      <Suspense fallback={
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-48 animate-pulse rounded-lg bg-muted" />
          ))}
        </div>
      }>
        <JobListings searchParams={searchParams} />
      </Suspense>
    </div>
  )
}
