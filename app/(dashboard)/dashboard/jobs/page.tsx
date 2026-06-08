// @ts-nocheck
import { createClient } from '@/utils/supabase/server'
import { getUser } from '@/utils/supabase/queries'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { JobActions } from '@/components/jobs/job-actions'
import { Plus, Eye, Users } from 'lucide-react'

function formatJobType(type: string): string {
  return type
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join('-')
}

function statusVariant(status: string | null): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (status) {
    case 'active':
      return 'default'
    case 'draft':
      return 'secondary'
    case 'closed':
      return 'outline'
    default:
      return 'secondary'
  }
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export default async function DashboardJobsPage() {
  const supabase = createClient() as any
  const user = await getUser(supabase)

  if (!user) {
    return redirect('/signin')
  }

  const { data: jobs, error } = await supabase
    .from('job_listings')
    .select('*')
    .eq('school_id', user.id)
    .order('created_at', { ascending: false })

  const stats = {
    total: jobs?.length || 0,
    active: jobs?.filter((j) => j.status === 'active').length || 0,
    draft: jobs?.filter((j) => j.status === 'draft').length || 0,
    totalViews: jobs?.reduce((sum, j) => sum + (j.views || 0), 0) || 0,
    totalApplications: jobs?.reduce((sum, j) => sum + (j.applications_count || 0), 0) || 0,
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40 gap-4 p-4 md:p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Job Listings</h1>
          <p className="text-muted-foreground">
            Manage your posted job listings
          </p>
        </div>
        <Link href="/dashboard/jobs/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Post New Job
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Jobs</CardDescription>
            <CardTitle className="text-2xl">{stats.total}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Active</CardDescription>
            <CardTitle className="text-2xl">{stats.active}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Views</CardDescription>
            <CardTitle className="text-2xl">{stats.totalViews}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Applications</CardDescription>
            <CardTitle className="text-2xl">{stats.totalApplications}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Job Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Listings</CardTitle>
        </CardHeader>
        <CardContent>
          {!jobs || jobs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Eye className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold">No job listings yet</h3>
              <p className="text-muted-foreground mt-1 mb-4">
                Post your first job listing to start receiving applications.
              </p>
              <Link href="/dashboard/jobs/new">
                <Button>Post Your First Job</Button>
              </Link>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead className="hidden md:table-cell">Location</TableHead>
                  <TableHead className="hidden md:table-cell">Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden md:table-cell text-right">
                    <span className="inline-flex items-center gap-1">
                      <Users className="h-3.5 w-3.5" />
                      Apps
                    </span>
                  </TableHead>
                  <TableHead className="hidden md:table-cell">Posted</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {jobs.map((job) => (
                  <TableRow key={job.id}>
                    <TableCell>
                      <div className="font-medium">{job.title}</div>
                      <div className="text-sm text-muted-foreground md:hidden">
                        {job.city ? `${job.city}, ${job.country}` : job.country}
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {job.city ? `${job.city}, ${job.country}` : job.country}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <Badge variant="secondary">{formatJobType(job.job_type)}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusVariant(job.status)}>
                        {job.status || 'draft'}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-right">
                      {job.applications_count || 0}
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground">
                      {formatDate(job.created_at)}
                    </TableCell>
                    <TableCell className="text-right">
                      <JobActions jobId={job.id} currentStatus={job.status} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
