import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const apiBase = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1'
  const baseUrl = apiBase.replace(/\/api\/v1\/?$/, '')
  const awaitedParams = await params
  const filePath = awaitedParams.path.join('/')
  const targetUrl = `${baseUrl}/uploads/${filePath}`

  try {
    const res = await fetch(targetUrl, {
      headers: {
        'ngrok-skip-browser-warning': 'true',
      },
    })

    if (!res.ok) {
      return new NextResponse(null, { status: res.status })
    }

    const contentType = res.headers.get('content-type') || 'image/jpeg'
    const buffer = await res.arrayBuffer()

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000',
      },
    })
  } catch {
    return new NextResponse(null, { status: 502 })
  }
}
