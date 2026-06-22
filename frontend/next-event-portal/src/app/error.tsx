'use client'

import { useEffect } from 'react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-4">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-black text-slate-800">Something went wrong</h2>
        <p className="text-sm text-slate-500">{error.message || 'An unexpected error occurred.'}</p>
      </div>
      <button
        onClick={reset}
        className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded-sm text-sm transition-all"
      >
        Try again
      </button>
    </div>
  )
}
