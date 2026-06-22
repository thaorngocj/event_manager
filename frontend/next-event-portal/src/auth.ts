import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'

const API_URL = process.env.API_INTERNAL_URL || process.env.NEXT_PUBLIC_API_URL || 'http://nest_backend:3000/api/v1'

// Demo accounts — work without a running backend
const DEMO_USERS: Record<string, { id: string; name: string; role: string; schoolId: string }> = {
  'admin@va.edu.vn': { id: 'admin-1', name: 'System Admin', role: 'ADMIN', schoolId: 'AD001' },
  'manager@va.edu.vn': { id: 'manager-1', name: 'Event Manager', role: 'EVENT_MANAGER', schoolId: 'MN001' },
  'student@va.edu.vn': { id: 'student-1', name: 'Nguyen Bang Nguyen', role: 'STUDENT', schoolId: '2374802010348' },
}
const DEMO_PASSWORD = 'password123'

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        const email = String(credentials.email).toLowerCase()
        const password = String(credentials.password)

        // Try real API first
        try {
          const res = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'ngrok-skip-browser-warning': 'true',
            },
            body: JSON.stringify({ email, password }),
          })
          if (res.ok) {
            const data = await res.json()
            // Backend trả về: { accessToken, refreshToken, role, email }
            // Lấy profile đầy đủ qua /users/me
            let name = data.email
            let id = data.email
            let schoolId = ''
            let major = ''
            let cohort = ''
            let classId = ''
            let unionRole = ''
            let facultyId = ''
            let trainingPoints = 0
            try {
              const meRes = await fetch(`${API_URL}/users/me`, {
                headers: {
                  Authorization: `Bearer ${data.accessToken}`,
                  'ngrok-skip-browser-warning': 'true',
                },
              })
              if (meRes.ok) {
                const me = await meRes.json()
                name = me.username || me.name || data.email
                id = String(me.id || data.email)
                schoolId = me.mssv || ''
                major = me.major || ''
                cohort = me.cohort || ''
                classId = me.classId || ''
                unionRole = me.unionRole || ''
                facultyId = me.facultyId ? String(me.facultyId) : ''
                trainingPoints = Number(me.trainingPoints) || 0
              }
            } catch { /* dùng email làm fallback */ }
            return {
              id,
              email: data.email,
              name,
              role: data.role,
              schoolId,
              major,
              cohort,
              classId,
              unionRole,
              facultyId,
              trainingPoints,
              accessToken: data.accessToken,
              refreshToken: data.refreshToken,
            }
          }
        } catch {
          // Backend not running — fall through to demo accounts
        }

        // Demo account fallback
        const demo = DEMO_USERS[email]
        if (demo && password === DEMO_PASSWORD) {
          return {
            id: demo.id,
            email,
            name: demo.name,
            role: demo.role,
            schoolId: demo.schoolId,
            accessToken: 'demo-token',
            refreshToken: 'demo-refresh-token',
          }
        }

        return null
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        const u = user as typeof user & {
          role: string; schoolId: string; accessToken: string; refreshToken: string
          major?: string; cohort?: string; classId?: string; unionRole?: string
          facultyId?: string; trainingPoints?: number
        }
        token.role = u.role
        token.schoolId = u.schoolId
        token.accessToken = u.accessToken
        token.refreshToken = u.refreshToken
        token.uid = user.id
        token.major = u.major
        token.cohort = u.cohort
        token.classId = u.classId
        token.unionRole = u.unionRole
        token.facultyId = u.facultyId
        token.trainingPoints = u.trainingPoints
      }
      return token
    },
    session({ session, token }) {
      session.user.role = token.role as string
      session.user.schoolId = token.schoolId as string
      session.user.accessToken = token.accessToken as string
      session.user.refreshToken = token.refreshToken as string
      session.user.uid = token.uid as string
      session.user.major = token.major as string | undefined
      session.user.cohort = token.cohort as string | undefined
      session.user.classId = token.classId as string | undefined
      session.user.unionRole = token.unionRole as string | undefined
      session.user.facultyId = token.facultyId as string | undefined
      session.user.trainingPoints = token.trainingPoints as number | undefined
      return session
    },
  },
  pages: {
    signIn: '/login',
  },
})
