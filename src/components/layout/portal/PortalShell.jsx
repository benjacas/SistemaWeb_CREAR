import { Outlet } from 'react-router-dom'
import PortalHeader from './PortalHeader'
import BottomNav from './BottomNav'

export default function PortalShell() {
  return (
    <div className="flex flex-col h-svh max-w-md mx-auto bg-primary-subtle">
      <PortalHeader />
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  )
}
