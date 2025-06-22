import type { AppProps } from 'next/app'
import dynamic from 'next/dynamic'
import { Toaster } from '@/components/ui/toaster'
import '@/styles/globals.css'

// Dynamically import AuthProvider to ensure it only runs on client
const AuthProvider = dynamic(
  () => import('@/lib/auth-context').then(mod => ({ default: mod.AuthProvider })),
  { ssr: false }
)

export default function App({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <Component {...pageProps} />
      <Toaster />
    </AuthProvider>
  )
}
