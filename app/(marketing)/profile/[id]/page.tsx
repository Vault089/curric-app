import { createClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import {
  ArrowLeft,
  MapPin,
  Mail,
  Globe,
  GraduationCap,
  Award,
  Briefcase,
  Languages,
  DollarSign,
  Download,
  PlayCircle,
  User,
} from 'lucide-react'

function extractYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\s]+)/,
    /youtube\.com\/shorts\/([^&\s]+)/,
  ]
  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match) return match[1]
  }
  return null
}

function extractVimeoId(url: string): string | null {
  const match = url.match(/vimeo\.com\/(\d+)/)
  return match ? match[1] : null
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export default async function PublicProfilePage({
  params,
}: {
  params: { id: string }
}) {
  const supabase = createClient() as any as any

  const { data: profile, error } = await supabase
    .from('teacher_profiles')
    .select('*')
    .eq('id', params.id)
    .single()

  if (error || !profile) {
    notFound()
  }

  // Only show public profiles to non-owners
  const { data: { user } } = await supabase.auth.getUser()
  const isOwner = user?.id === profile.id

  if (!profile.is_public && !isOwner) {
    notFound()
  }

  const youtubeId = profile.video_intro_url ? extractYouTubeId(profile.video_intro_url) : null
  const vimeoId = profile.video_intro_url ? extractVimeoId(profile.video_intro_url) : null

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      {/* Back link */}
      <Link
        href="/jobs"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to browse
      </Link>

      {/* Header section */}
      <div className="flex flex-col sm:flex-row items-start gap-6 mb-8">
        {profile.avatar_url ? (
          <img
            src={profile.avatar_url}
            alt={profile.full_name}
            className="h-28 w-28 rounded-full object-cover border-4 border-background shadow-lg"
          />
        ) : (
          <div className="flex h-28 w-28 items-center justify-center rounded-full bg-muted border-4 border-background shadow-lg">
            <User className="h-12 w-12 text-muted-foreground" />
          </div>
        )}
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">{profile.full_name}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            {profile.nationality && (
              <span className="inline-flex items-center gap-1">
                <Globe className="h-3.5 w-3.5" />
                {profile.nationality}
              </span>
            )}
            {(profile.current_country || profile.city) && (
              <span className="inline-flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" />
                {profile.city
                  ? `${profile.city}, ${profile.current_country}`
                  : profile.current_country}
              </span>
            )}
            {profile.years_experience != null && (
              <span className="inline-flex items-center gap-1">
                <Briefcase className="h-3.5 w-3.5" />
                {profile.years_experience} years experience
              </span>
            )}
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {profile.languages && profile.languages.length > 0 && (
              <>
                {profile.languages.map((lang: string) => (
                  <Badge key={lang} variant="secondary">
                    {lang}
                  </Badge>
                ))}
              </>
            )}
          </div>
        </div>
        <div className="flex gap-2 shrink-0">
          {isOwner && (
            <Button asChild variant="outline" size="sm">
              <Link href="/dashboard/profile">Edit Profile</Link>
            </Button>
          )}
          <Button asChild size="sm">
            <a href={`mailto:?subject=Teacher Profile: ${profile.full_name}&body=Check out this teacher profile: ${typeof window !== 'undefined' ? window.location.href : ''}`}>
              <Mail className="h-4 w-4 mr-1.5" />
              Contact
            </a>
          </Button>
        </div>
      </div>

      <Separator className="mb-8" />

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Bio */}
          {profile.bio && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">About</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap text-muted-foreground leading-relaxed">
                  {profile.bio}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Video Intro */}
          {profile.video_intro_url && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <PlayCircle className="h-5 w-5" />
                  Video Introduction
                </CardTitle>
              </CardHeader>
              <CardContent>
                {youtubeId ? (
                  <div className="aspect-video rounded-lg overflow-hidden">
                    <iframe
                      src={`https://www.youtube.com/embed/${youtubeId}`}
                      className="h-full w-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      title={`${profile.full_name}'s video introduction`}
                    />
                  </div>
                ) : vimeoId ? (
                  <div className="aspect-video rounded-lg overflow-hidden">
                    <iframe
                      src={`https://player.vimeo.com/video/${vimeoId}?badge=0&autopause=0&player_id=0`}
                      className="h-full w-full"
                      allow="autoplay; fullscreen; picture-in-picture"
                      allowFullScreen
                      title={`${profile.full_name}'s video introduction`}
                    />
                  </div>
                ) : (
                  <Button asChild variant="outline">
                    <a href={profile.video_intro_url} target="_blank" rel="noopener noreferrer">
                      <PlayCircle className="h-4 w-4 mr-2" />
                      Watch Video
                    </a>
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Qualifications */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Qualifications</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {profile.highest_education && (
                <div className="flex items-start gap-3">
                  <GraduationCap className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Education</p>
                    <p className="text-sm text-muted-foreground">
                      {profile.highest_education}
                      {profile.degree_field && ` — ${profile.degree_field}`}
                    </p>
                  </div>
                </div>
              )}
              {profile.years_experience != null && (
                <div className="flex items-start gap-3">
                  <Briefcase className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Experience</p>
                    <p className="text-sm text-muted-foreground">
                      {profile.years_experience} years
                    </p>
                  </div>
                </div>
              )}
              {profile.certifications && profile.certifications.length > 0 && (
                <div className="flex items-start gap-3">
                  <Award className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Certifications</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {profile.certifications.map((cert: string) => (
                        <Badge key={cert} variant="secondary" className="text-xs">
                          {cert}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Job Preferences */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Job Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {profile.preferred_countries && profile.preferred_countries.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-1.5">Preferred Countries</p>
                  <div className="flex flex-wrap gap-1">
                    {profile.preferred_countries.map((country: string) => (
                      <Badge key={country} variant="outline">
                        {country}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              {profile.preferred_job_types && profile.preferred_job_types.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-1.5">Job Types</p>
                  <div className="flex flex-wrap gap-1">
                    {profile.preferred_job_types.map((type: string) => (
                      <Badge key={type} variant="outline">
                        {(type as string).split('_').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              {profile.min_salary_usd != null && (
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    Minimum salary: <span className="font-medium text-foreground">${profile.min_salary_usd.toLocaleString()} USD/mo</span>
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* CV Download */}
          {profile.cv_url && (
            <Card>
              <CardContent className="pt-6">
                <Button asChild className="w-full" variant="outline">
                  <a href={profile.cv_url} target="_blank" rel="noopener noreferrer">
                    <Download className="h-4 w-4 mr-2" />
                    Download CV
                  </a>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
