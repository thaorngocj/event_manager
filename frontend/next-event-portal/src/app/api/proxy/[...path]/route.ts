import { NextRequest, NextResponse } from 'next/server'

const BACKEND = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1'

async function proxyHandler(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  const path = params.path.join('/')
  const targetUrl = `${BACKEND}/${path}${request.nextUrl.search}`

  const headers: Record<string, string> = {
    'ngrok-skip-browser-warning': 'true',
  }

  const contentType = request.headers.get('content-type')
  if (contentType) headers['content-type'] = contentType

  const authorization = request.headers.get('authorization')
  if (authorization) headers['authorization'] = authorization

  const method = request.method
  let body: ArrayBuffer | undefined
  if (!['GET', 'HEAD'].includes(method)) {
    try {
      body = await request.arrayBuffer()
    } catch {
      // no body
    }
  }

  try {
    const res = await fetch(targetUrl, { method, headers, body })
    const buffer = await res.arrayBuffer()
    const ct = res.headers.get('content-type') || 'application/json'

    return new NextResponse(buffer.byteLength > 0 ? buffer : null, {
      status: res.status,
      headers: { 'content-type': ct },
    })
  } catch {
    return NextResponse.json({ message: 'Proxy error' }, { status: 502 })
  }
}

export const GET = proxyHandler
export const POST = proxyHandler
export const PUT = proxyHandler
export const PATCH = proxyHandler
export const DELETE = proxyHandler
