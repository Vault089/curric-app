import { createClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { SaveJobButton } from '@/components/jobs/save-job-button'
import {
  ArrowLeft,
  MapPin,
  Building2,
  Calendar,
  DollarSign,
  Clock,
  GraduationCap,
  Award,
  Globe,
  Briefcase,
} from 'lucide-react'

function formatJobType(type: string): string {
  return type
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join('-')
}

function formatSalary(min: number | null, max: number | null, currency: string | null): string {
  const cur = currency || 'USD'
  if (min && max) return `$${min.toLocaleString()} - $${max.toLocaleString()} ${cur}/month`
  if (min) return `From $${min.toLocaleString()} ${cur}/month`
  if (max) return `Up to $${max.toLocaleString()} ${cur}/month`
  return 'Salary negotiable'
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return 'Not specified'
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export default async function JobDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const supabase = createClient()

  const { data: job, error } = await supabase
    .from('job_listings')
    .select(`
      *,
      school_profiles (org_name, country, city, website, logo_url, is_verified, description, contact_email)
    `)
    .eq('id', params.id)
    .single()

  if (error || !job) {
    notFound()
  }

  const school = job.school_profiles as any

  // Check if user has saved this job
  const { data: { user } } = await supabase.auth.getUser()
  let isSaved = false
  if (user) {
    const { data: saved } = await supabase
      .from('saved_jobs')
      .select('id')
      .eq('teacher_id', user.id)
      .eq('job_id', job.id)
      .single()
    isSaved = !!saved
  }

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      {/* Back link */}
      <Link
        href="/jobs"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to all jobs
      </Link>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          <div>
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold tracking-tight">{job.title}</h1>
                <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <Building2 className="h-3.5 w-3.5" />
                    {school?.org_name || 'Unknown School'}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" />
                    {job.city ? `${job.city}, ${job.country}` : job.country}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    {formatJobType(job.job_type)}
                  </span>
                </div>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {job.subject && <Badge variant="secondary">{job.subject}</Badge>}
              {job.grade_level && <Badge variant="secondary">{job.grade_level}</Badge>}
              {job.is_featured && <Badge className="bg-amber-500 hover:bg-amber-500">Featured</Badge>}
            </div>
          </div>

          <Separator />

          {/* Job Description */}
          <div>
            <h2 className="text-lg font-semibold mb-3">Job Description</h2>
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <p className="whitespace-pre-wrap text-muted-foreground">{job.description}</p>
            </div>
          </div>

          <Separator />

          {/* Requirements */}
          <div>
            <h2 className="text-lg font-semibold mb-3">Requirements</h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {job.min_experience != null && (
                <div className="flex items-center gap-3 rounded-lg border p-3">
                  <Briefcase className="h-5 w-5 text-muted-foreground shrink-0" />
                  <div>
                    <p className="text-sm font-medium">Experience</p>
                    <p className="text-sm text-muted-foreground">{job.min_experience}+ years</p>
                  </div>
                </div>
              )}
              {job.required_education && (
                <div className="flex items-center gap-3 rounded-lg border p-3">
                  <GraduationCap className="h-5 w-5 text-muted-foreground shrink-0" />
                  <div>
                    <p className="text-sm font-medium">Education</p>
                    <p className="text-sm text-muted-foreground">{job.required_education}</p>
                  </div>
                </div>
              )}
              {job.required_certifications && job.required_certifications.length > 0 && (
                <div className="flex items-center gap-3 rounded-lg border p-3">
                  <Award className="h-5 w-5 text-muted-foreground shrink-0" />
                  <div>
                    <p className="text-sm font-medium">Certifications</p>
                    <p className="text-sm text-muted-foreground">
                      {job.required_certifications.join(', ')}
                    </p>
                  </div>
                </div>
              )}
              {job.start_date && (
                <div className="flex items-center gap-3 rounded-lg border p-3">
                  <Calendar className="h-5 w-5 text-muted-foreground shrink-0" />
                  <div>
                    <p className="text-sm font-medium">Start Date</p>
                    <p className="text-sm text-muted-foreground">{formatDate(job.start_date)}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Salary Card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Salary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-green-600" />
                <span className="text-lg font-semibold">
                  {formatSalary(job.salary_min, job.salary_max, job.salary_currency)}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* School Info Card */}
          {school && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">About the School</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  {school.logo_url ? (
                    <img
                      src={school.logo_url}
                      alt={school.org_name}
                      className="h-12 w-12 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted">
                      <Building2 className="h-6 w-6 text-muted-foreground" />
                    </div>
                  )}
                  <div>
                    <p className="font-semibold">{school.org_name}</p>
                    {school.is_verified && (
                      <Badge variant="secondary" className="text-xs">Verified</Badge>
                    )}
                  </div>
                </div>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-3.5 w-3.5 shrink-0" />
                    <span>{school.city ? `${school.city}, ${school.country}` : school.country}</span>
                  </div>
                  {school.website && (
                    <div className="flex items-center gap-2">
                      <Globe className="h-3.5 w-3.5 shrink-0" />
                      <a
                        href={school.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:underline"
                      >
                        {school.website.replace(/^https?:\/\//, '')}
                      </a>
                    </div>
                  )}
                </div>
                {school.description && (
                  <p className="text-sm text-muted-foreground line-clamp-4">
                    {school.description}
                  </p>
                )}
              </CardContent>
            </Card>
          )}

          {/* Application deadline */}
          {job.application_deadline && (
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Apply by:</span>
                  <span className="font-medium">{formatDate(job.application_deadline)}</span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <div className="space-y-3">
            <Button asChild className="w-full" size="lg">
              <a href={user ? `/jobs/${job.id}/apply` : '/signin'}>
                Apply Now
              </a>
            </Button>
            <SaveJobButton jobId={job.id} initialSaved={isSaved} />
          </div>
        </div>
      </div>
    </div>
  )
}
