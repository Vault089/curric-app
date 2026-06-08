import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MapPin, Building2, Clock, DollarSign } from 'lucide-react'

type JobListing = {
  id: string
  title: string
  country: string
  city: string | null
  job_type: string
  subject: string | null
  salary_min: number | null
  salary_max: number | null
  salary_currency: string | null
  created_at: string | null
  is_featured: boolean | null
  school_profiles: {
    org_name: string
    logo_url: string | null
    is_verified: boolean | null
  } | null
}

function formatJobType(type: string): string {
  return type
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join('-')
}

function formatSalary(min: number | null, max: number | null, currency: string | null): string {
  const cur = currency || 'USD'
  if (min && max) return `$${min.toLocaleString()} - $${max.toLocaleString()} ${cur}`
  if (min) return `From $${min.toLocaleString()} ${cur}`
  if (max) return `Up to $${max.toLocaleString()} ${cur}`
  return 'Salary negotiable'
}

function timeAgo(dateStr: string | null): string {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays} days ago`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`
  return `${Math.floor(diffDays / 365)} years ago`
}

export function JobCard({ job }: { job: JobListing }) {
  const school = job.school_profiles

  return (
    <Link href={`/jobs/${job.id}`}>
      <Card className="h-full transition-all hover:shadow-md hover:border-zinc-300 dark:hover:border-zinc-600 cursor-pointer">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg leading-tight line-clamp-2">
                {job.title}
              </CardTitle>
            </div>
            {job.is_featured && (
              <Badge variant="default" className="shrink-0 bg-amber-500 text-white hover:bg-amber-500">
                Featured
              </Badge>
            )}
          </div>
          {school && (
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Building2 className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{school.org_name}</span>
              {school.is_verified && (
                <span className="text-blue-500 text-xs" title="Verified">✓</span>
              )}
            </div>
          )}
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex flex-col gap-1.5 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 shrink-0" />
              <span>{job.city ? `${job.city}, ${job.country}` : job.country}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <DollarSign className="h-3.5 w-3.5 shrink-0" />
              <span>{formatSalary(job.salary_min, job.salary_max, job.salary_currency)}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 shrink-0" />
              <span>{formatJobType(job.job_type)}</span>
              {job.subject && <span>· {job.subject}</span>}
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between">
            <Badge variant="secondary" className="text-xs">
              {formatJobType(job.job_type)}
            </Badge>
            <span className="text-xs text-muted-foreground">
              {timeAgo(job.created_at)}
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
