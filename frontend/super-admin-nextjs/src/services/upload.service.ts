import { apiClient } from '@/lib/api-client'

export const uploadService = {
  uploadImage: async (file: File): Promise<string> => {
    const form = new FormData()
    form.append('file', file)
    const { data } = await apiClient.post('/upload', form, {
      headers: { 'Content-Type': undefined }, // để axios tự set multipart + boundary
    })
    // Trả về đường dẫn gốc từ backend (e.g. '/uploads/filename.jpg')
    // để lưu vào database, hiển thị dùng getImageUrl() thông qua proxy
    return data.url as string
  },
}
