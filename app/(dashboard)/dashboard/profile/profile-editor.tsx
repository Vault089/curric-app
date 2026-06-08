'use client'

import { useState, useRef, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { updateProfile, uploadCV, uploadAvatar, ProfileFormData } from '@/app/actions/profile'
import { toast } from '@/components/ui/use-toast'
import {
  Save,
  Eye,
  Upload,
  X,
  FileText,
  User,
  Loader2,
  ExternalLink,
  Trash2,
} from 'lucide-react'

interface ProfileEditorProps {
  profile: {
    id: string
    full_name: string
    email: string
    phone: string | null
    nationality: string | null
    current_country: string | null
    city: string | null
    bio: string | null
    highest_education: string | null
    degree_field: string | null
    certifications: string[] | null
    years_experience: number | null
    languages: string[] | null
    preferred_countries: string[] | null
    preferred_job_types: string | null
    min_salary_usd: number | null
    avatar_url: string | null
    cv_url: string | null
    video_intro_url: string | null
    is_public: boolean | null
  }
}

function TagInput({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string
  value: string[]
  onChange: (val: string[]) => void
  placeholder?: string
}) {
  const [input, setInput] = useState('')

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      const trimmed = input.trim().replace(/,$/, '')
      if (trimmed && !value.includes(trimmed)) {
        onChange([...value, trimmed])
      }
      setInput('')
    } else if (e.key === 'Backspace' && !input && value.length > 0) {
      onChange(value.slice(0, -1))
    }
  }

  const removeTag = (tag: string) => {
    onChange(value.filter(t => t !== tag))
  }

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex flex-wrap gap-1.5 rounded-md border border-input bg-background px-3 py-2 min-h-[42px] focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
        {value.map(tag => (
          <Badge key={tag} variant="secondary" className="gap-1 pr-1">
            {tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              className="ml-0.5 rounded-full p-0.5 hover:bg-muted"
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={value.length === 0 ? placeholder : ''}
          className="flex-1 bg-transparent outline-none text-sm min-w-[120px] placeholder:text-muted-foreground"
        />
      </div>
      <p className="text-xs text-muted-foreground">
        Press Enter or comma to add
      </p>
    </div>
  )
}

const COUNTRIES = [
  'China', 'South Korea', 'Japan', 'Thailand', 'Vietnam',
  'Cambodia', 'Myanmar', 'Taiwan', 'Malaysia', 'Indonesia',
  'Saudi Arabia', 'UAE', 'Qatar', 'Kuwait', 'Bahrain',
  'Oman', 'Jordan', 'Egypt', 'Turkey', 'Mexico',
  'Colombia', 'Brazil', 'Spain', 'France', 'Germany',
  'Czech Republic', 'Poland', 'Hungary', 'Czechia', 'Georgia',
  'Russia', 'Uzbekistan', 'Cambodia', 'Laos', 'India',
  'Philippines', 'Singapore', 'Hong Kong', 'Morocco', 'Tunisia',
]

const JOB_TYPES = [
  'Full-time',
  'Part-time',
  'Contract',
  'Temporary',
  'Internship',
  'Remote',
  'Freelance',
]

const EDUCATION_LEVELS = [
  'High School Diploma',
  "Associate's Degree",
  "Bachelor's Degree",
  "Master's Degree",
  'Doctorate (PhD)',
  'TEFL Certificate',
  'TESOL Certificate',
  'CELTA',
  'DELTA',
  'Teaching License',
]

export default function ProfileEditor({ profile }: ProfileEditorProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [isSaving, setIsSaving] = useState(false)
  const [isUploading, setIsUploading] = useState<string | null>(null)

  const avatarInputRef = useRef<HTMLInputElement>(null)
  const cvInputRef = useRef<HTMLInputElement>(null)

  const [avatarPreview, setAvatarPreview] = useState(profile.avatar_url || '')
  const [cvName, setCvName] = useState(
    profile.cv_url ? profile.cv_url.split('/').pop()?.split('?')[0]?.split('/').pop() || 'CV uploaded' : ''
  )

  // Form state
  const [formData, setFormData] = useState<ProfileFormData>({
    full_name: profile.full_name || '',
    phone: profile.phone || '',
    nationality: profile.nationality || '',
    current_country: profile.current_country || '',
    city: profile.city || '',
    bio: profile.bio || '',
    highest_education: profile.highest_education || '',
    degree_field: profile.degree_field || '',
    certifications: (profile.certifications || []).join(', '),
    years_experience: profile.years_experience?.toString() || '',
    languages: (profile.languages || []).join(', '),
    preferred_countries: (profile.preferred_countries || []).join(', '),
    preferred_job_types: Array.isArray(profile.preferred_job_types)
      ? (profile.preferred_job_types as unknown as string[]).join(', ')
      : (profile.preferred_job_types as string) || '',
    min_salary_usd: profile.min_salary_usd?.toString() || '',
    video_intro_url: profile.video_intro_url || '',
    is_public: profile.is_public ?? true,
  })

  const updateField = (field: keyof ProfileFormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const result = await updateProfile(formData)
      if (result.error) {
        toast({ title: 'Error', description: result.error, variant: 'destructive' })
      } else {
        toast({ title: 'Profile updated', description: 'Your profile has been saved.' })
        router.refresh()
      }
    } catch (err) {
      toast({ title: 'Error', description: 'Something went wrong.', variant: 'destructive' })
    } finally {
      setIsSaving(false)
    }
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type and size
    if (!file.type.startsWith('image/')) {
      toast({ title: 'Error', description: 'Please upload an image file.', variant: 'destructive' })
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: 'Error', description: 'Image must be under 5MB.', variant: 'destructive' })
      return
    }

    setIsUploading('avatar')
    try {
      // Show preview immediately
      const previewUrl = URL.createObjectURL(file)
      setAvatarPreview(previewUrl)

      const result = await uploadAvatar(file)
      if (result.error) {
        toast({ title: 'Upload failed', description: result.error, variant: 'destructive' })
      } else if (result.url) {
        setAvatarPreview(result.url)
        toast({ title: 'Avatar uploaded', description: 'Your profile picture has been updated.' })
        router.refresh()
      }
    } catch {
      toast({ title: 'Error', description: 'Upload failed.', variant: 'destructive' })
    } finally {
      setIsUploading(null)
      // Reset file input
      if (avatarInputRef.current) avatarInputRef.current.value = ''
    }
  }

  const handleCVUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ]
    if (!allowedTypes.includes(file.type)) {
      toast({ title: 'Error', description: 'Please upload a PDF or Word document.', variant: 'destructive' })
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      toast({ title: 'Error', description: 'File must be under 10MB.', variant: 'destructive' })
      return
    }

    setIsUploading('cv')
    try {
      setCvName(file.name)
      const result = await uploadCV(file)
      if (result.error) {
        toast({ title: 'Upload failed', description: result.error, variant: 'destructive' })
        setCvName('')
      } else {
        toast({ title: 'CV uploaded', description: 'Your CV has been uploaded successfully.' })
        router.refresh()
      }
    } catch {
      toast({ title: 'Error', description: 'Upload failed.', variant: 'destructive' })
    } finally {
      setIsUploading(null)
      if (cvInputRef.current) cvInputRef.current.value = ''
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Edit Profile</h1>
          <p className="text-muted-foreground mt-1">
            Manage your teacher profile and preferences.
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href={`/profile/${profile.id}`} target="_blank">
              <Eye className="h-4 w-4 mr-1.5" />
              Preview
              <ExternalLink className="h-3 w-3 ml-1" />
            </Link>
          </Button>
          <Button size="sm" onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-1.5" />
            )}
            Save Profile
          </Button>
        </div>
      </div>

      {/* Avatar & Media */}
      <Card>
        <CardHeader>
          <CardTitle>Profile Photo & Media</CardTitle>
          <CardDescription>
            Upload a profile photo and optionally add a video introduction.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-start gap-6">
            <div className="shrink-0">
              {avatarPreview ? (
                <img
                  src={avatarPreview}
                  alt="Avatar"
                  className="h-24 w-24 rounded-full object-cover border-2 border-muted"
                />
              ) : (
                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-muted border-2 border-dashed border-muted-foreground/25">
                  <User className="h-10 w-10 text-muted-foreground/50" />
                </div>
              )}
            </div>
            <div className="space-y-2">
              <input
                type="file"
                ref={avatarInputRef}
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => avatarInputRef.current?.click()}
                disabled={isUploading === 'avatar'}
              >
                {isUploading === 'avatar' ? (
                  <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4 mr-1.5" />
                )}
                {avatarPreview ? 'Change Photo' : 'Upload Photo'}
              </Button>
              <p className="text-xs text-muted-foreground">
                JPG, PNG or WebP. Max 5MB.
              </p>
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <Label htmlFor="video_intro_url">Video Introduction URL</Label>
            <Input
              id="video_intro_url"
              type="url"
              placeholder="https://youtube.com/watch?v=..."
              value={formData.video_intro_url}
              onChange={e => updateField('video_intro_url', e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Paste a YouTube or Vimeo link for your video introduction.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Basic Info */}
      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
          <CardDescription>
            Your basic details that schools will see on your profile.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="full_name">Full Name *</Label>
              <Input
                id="full_name"
                value={formData.full_name}
                onChange={e => updateField('full_name', e.target.value)}
                placeholder="Your full name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={e => updateField('phone', e.target.value)}
                placeholder="+1 (555) 123-4567"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="nationality">Nationality</Label>
              <Input
                id="nationality"
                value={formData.nationality}
                onChange={e => updateField('nationality', e.target.value)}
                placeholder="e.g. American"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="current_country">Current Country</Label>
              <Input
                id="current_country"
                value={formData.current_country}
                onChange={e => updateField('current_country', e.target.value)}
                placeholder="e.g. South Korea"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={e => updateField('city', e.target.value)}
                placeholder="e.g. Seoul"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">About Me</Label>
            <Textarea
              id="bio"
              rows={5}
              value={formData.bio}
              onChange={e => updateField('bio', e.target.value)}
              placeholder="Tell schools about your teaching experience, philosophy, and what makes you unique..."
            />
          </div>
        </CardContent>
      </Card>

      {/* Qualifications */}
      <Card>
        <CardHeader>
          <CardTitle>Qualifications</CardTitle>
          <CardDescription>
            Your education and professional credentials.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="highest_education">Highest Education</Label>
              <Input
                id="highest_education"
                value={formData.highest_education}
                onChange={e => updateField('highest_education', e.target.value)}
                placeholder="e.g. Master's Degree"
                list="education-list"
              />
              <datalist id="education-list">
                {EDUCATION_LEVELS.map(level => (
                  <option key={level} value={level} />
                ))}
              </datalist>
            </div>
            <div className="space-y-2">
              <Label htmlFor="degree_field">Degree Field</Label>
              <Input
                id="degree_field"
                value={formData.degree_field}
                onChange={e => updateField('degree_field', e.target.value)}
                placeholder="e.g. English Literature"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <TagInput
              label="Certifications"
              value={formData.certifications.split(',').map(s => s.trim()).filter(Boolean)}
              onChange={tags => updateField('certifications', tags.join(', '))}
              placeholder="e.g. TEFL, CELTA"
            />
            <div className="space-y-2">
              <Label htmlFor="years_experience">Years of Experience</Label>
              <Input
                id="years_experience"
                type="number"
                min="0"
                max="50"
                value={formData.years_experience}
                onChange={e => updateField('years_experience', e.target.value)}
                placeholder="e.g. 5"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Languages & Preferences */}
      <Card>
        <CardHeader>
          <CardTitle>Languages & Preferences</CardTitle>
          <CardDescription>
            Languages you speak and your job search preferences.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <TagInput
            label="Languages Spoken"
            value={formData.languages.split(',').map(s => s.trim()).filter(Boolean)}
            onChange={tags => updateField('languages', tags.join(', '))}
            placeholder="e.g. English, Spanish, Mandarin"
          />

          <TagInput
            label="Preferred Countries"
            value={formData.preferred_countries.split(',').map(s => s.trim()).filter(Boolean)}
            onChange={tags => updateField('preferred_countries', tags.join(', '))}
            placeholder="e.g. Japan, South Korea, Thailand"
          />

          <TagInput
            label="Preferred Job Types"
            value={formData.preferred_job_types.split(',').map(s => s.trim()).filter(Boolean)}
            onChange={tags => updateField('preferred_job_types', tags.join(', '))}
            placeholder="e.g. Full-time, Remote"
          />

          <div className="space-y-2">
            <Label htmlFor="min_salary_usd">Minimum Salary (USD/month)</Label>
            <Input
              id="min_salary_usd"
              type="number"
              min="0"
              step="100"
              value={formData.min_salary_usd}
              onChange={e => updateField('min_salary_usd', e.target.value)}
              placeholder="e.g. 2000"
            />
          </div>
        </CardContent>
      </Card>

      {/* CV Upload */}
      <Card>
        <CardHeader>
          <CardTitle>Resume / CV</CardTitle>
          <CardDescription>
            Upload your CV so schools can review your full experience.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <input
              type="file"
              ref={cvInputRef}
              accept=".pdf,.doc,.docx"
              onChange={handleCVUpload}
              className="hidden"
            />
            {cvName ? (
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm font-medium">{cvName}</p>
                  {profile.cv_url && (
                    <a
                      href={profile.cv_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-muted-foreground hover:underline"
                    >
                      View uploaded CV
                    </a>
                  )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => cvInputRef.current?.click()}
                  disabled={isUploading === 'cv'}
                >
                  {isUploading === 'cv' ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    'Replace'
                  )}
                </Button>
              </div>
            ) : (
              <Button
                variant="outline"
                onClick={() => cvInputRef.current?.click()}
                disabled={isUploading === 'cv'}
              >
                {isUploading === 'cv' ? (
                  <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4 mr-1.5" />
                )}
                Upload CV
              </Button>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            PDF or Word document. Max 10MB.
          </p>
        </CardContent>
      </Card>

      {/* Visibility */}
      <Card>
        <CardHeader>
          <CardTitle>Profile Visibility</CardTitle>
          <CardDescription>
            Control whether your profile is visible to schools.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="is_public">Public Profile</Label>
              <p className="text-sm text-muted-foreground">
                When enabled, schools can find and view your profile.
              </p>
            </div>
            <Switch
              id="is_public"
              checked={formData.is_public}
              onCheckedChange={checked => updateField('is_public', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Bottom action bar */}
      <div className="flex justify-end gap-3 pb-8">
        <Button asChild variant="outline">
          <Link href={`/profile/${profile.id}`} target="_blank">
            <Eye className="h-4 w-4 mr-1.5" />
            Preview Profile
          </Link>
        </Button>
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? (
            <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
          ) : (
            <Save className="h-4 w-4 mr-1.5" />
          )}
          Save Profile
        </Button>
      </div>
    </div>
  )
}
