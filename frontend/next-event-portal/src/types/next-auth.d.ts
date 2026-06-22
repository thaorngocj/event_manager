import { DefaultSession } from 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      role: string
      schoolId: string
      accessToken: string
      refreshToken: string
      uid: string
      trainingPoints?: number
      major?: string
      cohort?: string
      classId?: string
      unionRole?: string
      facultyId?: string
    } & DefaultSession['user']
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role?: string
    schoolId?: string
    accessToken?: string
    refreshToken?: string
    uid?: string
    trainingPoints?: number
    major?: string
    cohort?: string
    classId?: string
    unionRole?: string
    facultyId?: string
  }
}
