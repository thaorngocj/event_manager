import { apiClient } from '@/lib/api-client'

function toAbsoluteUrl(relativePath: string): string {
  const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1'
  const origin = apiBase.replace(/\/api\/v1\/?$/, '')
  return `${origin}${relativePath}`
}

export const uploadService = {
  uploadImage: async (file: File): Promise<string> => {
    const form = new FormData()
    form.append('file', file)
    const { data } = await apiClient.post('/upload', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return toAbsoluteUrl(data.url as string)
  },
}
