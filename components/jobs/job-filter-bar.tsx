'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Search, X } from 'lucide-react'

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

export function JobFilterBar() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const country = searchParams.get('country') || ''
  const jobType = searchParams.get('job_type') || ''
  const q = searchParams.get('q') || ''

  // Local state for search input to avoid navigating on every keystroke
  const [searchValue, setSearchValue] = useState(q)

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value) {
        params.set(name, value)
      } else {
        params.delete(name)
      }
      return params.toString()
    },
    [searchParams]
  )

  const pushParams = useCallback(
    (name: string, value: string) => {
      router.push(`/jobs?${createQueryString(name, value)}`)
    },
    [router, createQueryString]
  )

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      pushParams('q', searchValue)
    }
  }

  const handleSearchBlur = () => {
    if (searchValue !== q) {
      pushParams('q', searchValue)
    }
  }

  const hasActiveFilters = country || jobType || q

  return (
    <div className="rounded-lg border bg-card p-4 shadow-sm">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search jobs by title..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onKeyDown={handleSearchKeyDown}
            onBlur={handleSearchBlur}
            className="pl-9"
          />
        </div>

        <Select
          value={country || undefined}
          onValueChange={(val) => pushParams('country', val === 'all' ? '' : val)}
        >
          <SelectTrigger>
            <SelectValue placeholder="All Countries" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Countries</SelectItem>
            {countries.map((c) => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={jobType || undefined}
          onValueChange={(val) => pushParams('job_type', val === 'all' ? '' : val)}
        >
          <SelectTrigger>
            <SelectValue placeholder="All Job Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {jobTypes.map((jt) => (
              <SelectItem key={jt.value} value={jt.value}>{jt.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {hasActiveFilters ? (
          <Button
            variant="outline"
            onClick={() => {
              setSearchValue('')
              router.push('/jobs')
            }}
            className="flex items-center gap-1.5"
          >
            <X className="h-4 w-4" />
            Clear Filters
          </Button>
        ) : (
          <div />
        )}
      </div>
    </div>
  )
}
