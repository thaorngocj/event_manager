'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const router = useRouter()

  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
      <div className="text-center space-y-2">
        <h2 className="text-xl font-black text-slate-800">Page Error</h2>
        <p className="text-sm text-slate-500 max-w-sm">
          {error.message || 'This page encountered an unexpected error.'}
        </p>
      </div>
      <div className="flex gap-3">
        <button
          onClick={reset}
          className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-5 rounded-sm text-sm transition-all"
        >
          Try again
        </button>
        <button
          onClick={() => router.push('/dashboard')}
          className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2 px-5 rounded-sm text-sm transition-all"
        >
          Go to Dashboard
        </button>
      </div>
    </div>
  )
}
