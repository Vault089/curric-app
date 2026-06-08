'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Bookmark, BookmarkCheck } from 'lucide-react'
import { toggleSaveJob } from '@/app/actions/jobs'

export function SaveJobButton({
  jobId,
  initialSaved = false,
}: {
  jobId: string
  initialSaved?: boolean
}) {
  const [saved, setSaved] = useState(initialSaved)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleToggle = async () => {
    setLoading(true)
    const result = await toggleSaveJob(jobId)
    setLoading(false)

    if ('error' in result && result.error === 'Not authenticated') {
      router.push('/signin')
      return
    }

    if ('saved' in result) {
      setSaved(result.saved)
    }
  }

  return (
    <Button
      variant={saved ? 'default' : 'outline'}
      onClick={handleToggle}
      disabled={loading}
      className="gap-2"
    >
      {saved ? (
        <>
          <BookmarkCheck className="h-4 w-4" />
          Saved
        </>
      ) : (
        <>
          <Bookmark className="h-4 w-4" />
          Save Job
        </>
      )}
    </Button>
  )
}
