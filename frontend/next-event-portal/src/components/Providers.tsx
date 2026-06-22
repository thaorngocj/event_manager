'use client'

import { useState } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { SessionProvider } from 'next-auth/react'
import { NextIntlClientProvider } from 'next-intl'
import { AuthProvider } from '@/context/AuthContext'
import { LanguageProvider } from '@/context/LanguageContext'
import { EventsProvider } from '@/context/EventsContext'
import { RegistrationsProvider } from '@/context/RegistrationsContext'
import { UsersProvider } from '@/context/UsersContext'
import { useLanguageStore } from '@/lib/stores/languageStore'
import { Toaster } from 'sonner'
import enMessages from '../../messages/en.json'
import viMessages from '../../messages/vi.json'

const messages = { EN: enMessages, VI: viMessages }

function IntlWrapper({ children }: { children: React.ReactNode }) {
  const { language } = useLanguageStore()
  return (
    <NextIntlClientProvider locale={language} messages={messages[language]}>
      {children}
    </NextIntlClientProvider>
  )
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            retry: 1,
          },
        },
      })
  )

  return (
    <QueryClientProvider client={queryClient}>
      <SessionProvider>
        <IntlWrapper>
          <AuthProvider>
            <LanguageProvider>
              <EventsProvider>
                <RegistrationsProvider>
                  <UsersProvider>
                    {children}
                    <Toaster richColors position="top-right" />
                  </UsersProvider>
                </RegistrationsProvider>
              </EventsProvider>
            </LanguageProvider>
          </AuthProvider>
        </IntlWrapper>
      </SessionProvider>
    </QueryClientProvider>
  )
}
