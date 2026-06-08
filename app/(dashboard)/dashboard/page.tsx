// @ts-nocheck
import { createClient } from '@/utils/supabase/server';
import {
  getUser,
  getUserDetails,
  getTeacherProfile,
  getSavedJobsCount,
  getApplicationsCount,
  getRecentJobs
} from '@/utils/supabase/queries';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Briefcase,
  Send,
  User,
  Bookmark,
  MapPin,
  Building2,
  ArrowRight
} from 'lucide-react';

export default async function DashboardPage() {
  const supabase = createClient();
  const [user, userDetails] = await Promise.all([
    getUser(supabase),
    getUserDetails(supabase)
  ]);

  if (!user) {
    return redirect('/signin');
  }

  const [teacherProfile, savedJobsCount, applicationsCount, recentJobs] =
    await Promise.all([
      getTeacherProfile(supabase, user.id),
      getSavedJobsCount(supabase, user.id),
      getApplicationsCount(supabase, user.id),
      getRecentJobs(supabase, 4)
    ]);

  const displayName =
    teacherProfile?.full_name || userDetails?.full_name || 'Teacher';

  // Calculate profile completeness
  const profileFields = [
    teacherProfile?.full_name,
    teacherProfile?.email,
    teacherProfile?.phone,
    teacherProfile?.nationality,
    teacherProfile?.current_country,
    teacherProfile?.city,
    teacherProfile?.bio,
    teacherProfile?.highest_education,
    teacherProfile?.degree_field,
    teacherProfile?.years_experience,
    teacherProfile?.languages?.length,
    teacherProfile?.preferred_countries?.length,
    teacherProfile?.preferred_job_types?.length,
    teacherProfile?.cv_url,
    teacherProfile?.avatar_url
  ];
  const filledFields = profileFields.filter(
    (f) => f !== null && f !== undefined && f !== 0
  ).length;
  const profileCompleteness = Math.round(
    (filledFields / profileFields.length) * 100
  );

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Welcome back, {displayName.split(' ')[0]}
        </h1>
        <p className="text-muted-foreground">
          Here&rsquo;s an overview of your teaching job search.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Jobs Saved</CardTitle>
            <Bookmark className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{savedJobsCount}</div>
            <p className="text-xs text-muted-foreground">
              jobs you&rsquo;ve bookmarked
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Applications Sent
            </CardTitle>
            <Send className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{applicationsCount}</div>
            <p className="text-xs text-muted-foreground">
              total applications submitted
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Profile Completeness
            </CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{profileCompleteness}%</div>
            <div className="mt-2 h-2 w-full rounded-full bg-secondary">
              <div
                className="h-2 rounded-full bg-primary"
                style={{ width: `${profileCompleteness}%` }}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-3">
        <Link href="/dashboard/jobs">
          <Card className="transition-colors hover:bg-accent cursor-pointer">
            <CardContent className="flex items-center gap-4 p-6">
              <Briefcase className="h-8 w-8 text-primary" />
              <div className="flex-1">
                <h3 className="font-semibold">Browse Jobs</h3>
                <p className="text-sm text-muted-foreground">
                  Find your next teaching position
                </p>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
            </CardContent>
          </Card>
        </Link>
        <Link href="/dashboard/profile">
          <Card className="transition-colors hover:bg-accent cursor-pointer">
            <CardContent className="flex items-center gap-4 p-6">
              <User className="h-8 w-8 text-primary" />
              <div className="flex-1">
                <h3 className="font-semibold">Edit Profile</h3>
                <p className="text-sm text-muted-foreground">
                  Update your teacher profile
                </p>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
            </CardContent>
          </Card>
        </Link>
        <Link href="/dashboard/applications">
          <Card className="transition-colors hover:bg-accent cursor-pointer">
            <CardContent className="flex items-center gap-4 p-6">
              <Send className="h-8 w-8 text-primary" />
              <div className="flex-1">
                <h3 className="font-semibold">View Applications</h3>
                <p className="text-sm text-muted-foreground">
                  Track your application status
                </p>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Recent Job Matches */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Recent Job Matches</h2>
          <Button asChild variant="ghost" size="sm">
            <Link href="/dashboard/jobs">
              View All <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </div>
        {recentJobs.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Briefcase className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                No job listings available yet. Check back soon!
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {recentJobs.map((job) => (
              <Link key={job.id} href={`/dashboard/jobs/${job.id}`}>
                <Card className="transition-colors hover:bg-accent cursor-pointer h-full">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <h3 className="font-semibold">{job.title}</h3>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Building2 className="h-4 w-4" />
                          <span>
                            {job.school_profiles?.org_name || 'School'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <MapPin className="h-4 w-4" />
                          <span>
                            {job.city ? `${job.city}, ` : ''}
                            {job.country}
                          </span>
                        </div>
                      </div>
                      <Badge variant="secondary">{job.job_type}</Badge>
                    </div>
                    {job.salary_min && job.salary_max && (
                      <p className="mt-3 text-sm font-medium">
                        ${job.salary_min.toLocaleString()} - $
                        {job.salary_max.toLocaleString()}{' '}
                        {job.salary_currency || 'USD'}/yr
                      </p>
                    )}
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
