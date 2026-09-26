import { BottomNav } from '@/components/nav/BottomNav'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <main className="pb-nav min-h-dvh">
        {children}
      </main>
      <BottomNav />
    </>
  )
}
