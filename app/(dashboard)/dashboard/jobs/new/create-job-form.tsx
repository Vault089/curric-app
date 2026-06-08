'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { createJobListing, type JobFormData } from '@/app/actions/jobs'

const countries = [
  'Vietnam', 'Thailand', 'China', 'Japan', 'South Korea',
  'Saudi Arabia', 'UAE', 'Qatar', 'Kuwait', 'Oman',
  'Turkey', 'Spain', 'Poland', 'Czech Republic', 'Hungary',
  'Colombia', 'Mexico', 'Brazil', 'Chile',
  'Indonesia', 'Cambodia', 'Myanmar', 'Laos', 'Malaysia',
  'Taiwan', 'Hong Kong', 'Singapore',
]

const jobTypes = [
  { value: 'full_time', label: 'Full-time' },
  { value: 'part_time', label: 'Part-time' },
  { value: 'contract', label: 'Contract' },
  { value: 'online', label: 'Online/Remote' },
]

const subjects = [
  'English', 'Mathematics', 'Science', 'Physics', 'Chemistry', 'Biology',
  'History', 'Geography', 'Art', 'Music', 'PE/Sports',
  'Computer Science', 'Business', 'Economics',
  'Kindergarten/Early Years', 'General/Primary',
]

const gradeLevels = [
  'Early Years', 'Primary', 'Secondary', 'High School',
  'University/College', 'Adult Education',
]

const educationLevels = [
  "Bachelor's Degree",
  "Master's Degree",
  'PhD/Doctorate',
  'TEFL/TESOL/CELTA',
  'Teaching License',
  'Other Certification',
]

export function CreateJobForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState<JobFormData>({
    title: '',
    description: '',
    country: '',
    city: '',
    job_type: '',
    subject: '',
    grade_level: '',
    salary_min: '',
    salary_max: '',
    min_experience: '',
    required_education: '',
    start_date: '',
    application_deadline: '',
    status: 'draft',
  })

  const updateField = (field: keyof JobFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (statusOverride?: string) => {
    setError(null)

    if (!formData.title.trim()) return setError('Job title is required')
    if (!formData.description.trim()) return setError('Job description is required')
    if (!formData.country) return setError('Country is required')
    if (!formData.job_type) return setError('Job type is required')

    const submitData = { ...formData }
    if (statusOverride) {
      submitData.status = statusOverride
    }

    setLoading(true)
    const result = await createJobListing(submitData)
    setLoading(false)

    if ('error' in result && result.error) {
      setError(result.error)
      return
    }

    router.push('/dashboard/jobs')
  }

  return (
    <form onSubmit={(e) => { e.preventDefault(); handleSubmit() }} className="space-y-6 max-w-3xl">
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300">
          {error}
        </div>
      )}

      {/* Basic Info */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
          <CardDescription>Core details about the position</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Job Title *</Label>
            <Input
              id="title"
              placeholder="e.g. English Teacher, Math Instructor"
              value={formData.title}
              onChange={(e) => updateField('title', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Job Description *</Label>
            <Textarea
              id="description"
              placeholder="Describe the role, responsibilities, and what makes this opportunity great..."
              rows={8}
              value={formData.description}
              onChange={(e) => updateField('description', e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Job Type *</Label>
              <Select value={formData.job_type} onValueChange={(val) => updateField('job_type', val)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select job type" />
                </SelectTrigger>
                <SelectContent>
                  {jobTypes.map((jt) => (
                    <SelectItem key={jt.value} value={jt.value}>{jt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Subject</Label>
              <Select value={formData.subject} onValueChange={(val) => updateField('subject', val)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select subject" />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Grade Level</Label>
            <Select value={formData.grade_level} onValueChange={(val) => updateField('grade_level', val)}>
              <SelectTrigger>
                <SelectValue placeholder="Select grade level" />
              </SelectTrigger>
              <SelectContent>
                {gradeLevels.map((gl) => (
                  <SelectItem key={gl} value={gl}>{gl}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Location */}
      <Card>
        <CardHeader>
          <CardTitle>Location</CardTitle>
          <CardDescription>Where the job is based</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Country *</Label>
              <Select value={formData.country} onValueChange={(val) => updateField('country', val)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select country" />
                </SelectTrigger>
                <SelectContent>
                  {countries.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                placeholder="e.g. Ho Chi Minh City, Bangkok"
                value={formData.city}
                onChange={(e) => updateField('city', e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Salary & Requirements */}
      <Card>
        <CardHeader>
          <CardTitle>Salary & Requirements</CardTitle>
          <CardDescription>Compensation and candidate requirements</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="salary_min">Minimum Salary (USD/month)</Label>
              <Input
                id="salary_min"
                type="number"
                placeholder="e.g. 1500"
                value={formData.salary_min}
                onChange={(e) => updateField('salary_min', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="salary_max">Maximum Salary (USD/month)</Label>
              <Input
                id="salary_max"
                type="number"
                placeholder="e.g. 3000"
                value={formData.salary_max}
                onChange={(e) => updateField('salary_max', e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="min_experience">Minimum Experience (years)</Label>
              <Input
                id="min_experience"
                type="number"
                placeholder="e.g. 2"
                value={formData.min_experience}
                onChange={(e) => updateField('min_experience', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Required Education</Label>
              <Select value={formData.required_education} onValueChange={(val) => updateField('required_education', val)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select education level" />
                </SelectTrigger>
                <SelectContent>
                  {educationLevels.map((el) => (
                    <SelectItem key={el} value={el}>{el}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dates */}
      <Card>
        <CardHeader>
          <CardTitle>Dates</CardTitle>
          <CardDescription>Timeline for the position</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="start_date">Start Date</Label>
              <Input
                id="start_date"
                type="date"
                value={formData.start_date}
                onChange={(e) => updateField('start_date', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="application_deadline">Application Deadline</Label>
              <Input
                id="application_deadline"
                type="date"
                value={formData.application_deadline}
                onChange={(e) => updateField('application_deadline', e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* Actions */}
      <div className="flex items-center justify-between">
        <Button
          type="button"
          variant="outline"
          onClick={() => setFormData((prev) => ({ ...prev, status: 'draft' }))}
          disabled={loading}
        >
          Save as Draft
        </Button>
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setFormData((prev) => ({ ...prev, status: 'draft' }))
              handleSubmit(new Event('submit') as any)
            }}
            disabled={loading}
          >
            Publish Now
          </Button>
        </div>
      </div>
    </form>
  )
}
