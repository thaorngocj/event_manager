import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1'
  const baseUrl = apiBase.replace(/\/api\/v1\/?$/, '')

  // Lấy path từ URL trực tiếp thay vì dùng params (tránh vấn đề async params Next.js 15+)
  const url = new URL(request.url)
  const pathSegments = url.pathname.replace(/^\/api\/uploads\//, '')
  const targetUrl = `${baseUrl}/uploads/${pathSegments}`

  try {
    const res = await fetch(targetUrl, {
      headers: { 'ngrok-skip-browser-warning': 'true' },
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
