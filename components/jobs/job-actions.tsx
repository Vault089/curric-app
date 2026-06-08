// @ts-nocheck
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { MoreHorizontal, Eye, EyeOff, Trash2, Archive, RotateCcw } from 'lucide-react'
import { updateJobStatus, deleteJobListing } from '@/app/actions/jobs'

export function JobActions({
  jobId,
  currentStatus,
}: {
  jobId: string
  currentStatus: string | null
}) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleStatusChange = async (newStatus: string) => {
    setLoading(true)
    const result = await updateJobStatus(jobId, newStatus)
    setLoading(false)
    if ('error' in result && result.error) {
      alert(result.error)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this job listing? This cannot be undone.')) return
    setLoading(true)
    const result = await deleteJobListing(jobId)
    setLoading(false)
    if ('error' in result && result.error) {
      alert(result.error)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" disabled={loading}>
          <MoreHorizontal className="h-4 w-4" />
          <span className="sr-only">Actions</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {currentStatus === 'active' && (
          <DropdownMenuItem onClick={() => handleStatusChange('closed')}>
            <Archive className="mr-2 h-4 w-4" />
            Close Listing
          </DropdownMenuItem>
        )}
        {currentStatus === 'closed' && (
          <DropdownMenuItem onClick={() => handleStatusChange('active')}>
            <RotateCcw className="mr-2 h-4 w-4" />
            Reopen Listing
          </DropdownMenuItem>
        )}
        {currentStatus === 'draft' && (
          <DropdownMenuItem onClick={() => handleStatusChange('active')}>
            <Eye className="mr-2 h-4 w-4" />
            Publish
          </DropdownMenuItem>
        )}
        {currentStatus === 'active' && (
          <DropdownMenuItem onClick={() => handleStatusChange('draft')}>
            <EyeOff className="mr-2 h-4 w-4" />
            Unpublish (Draft)
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleDelete}
          className="text-red-600 focus:text-red-600"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
