import { createFileRoute, Link, Outlet } from '@tanstack/react-router'
import { 
  LayoutDashboard, 
  Sparkles, 
  Settings, 
  History, 
  User,
  Image as ImageIcon,
  Video as VideoIcon,
  MessageSquare,
  Zap
} from 'lucide-react'
import { cn } from '@/lib/utils'

export const Route = createFileRoute('/_authenticated')({
  component: AuthenticatedLayout,
})

function AuthenticatedLayout() {
  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'AI Generator', href: '/ai-generator', icon: Sparkles },
    { name: 'History', href: '/history', icon: History },
    { name: 'Projects', href: '/projects', icon: Zap },
    { name: 'Settings', href: '/settings', icon: Settings },
  ]

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-card flex flex-col">
        <div className="p-6">
          <Link to="/" className="flex items-center gap-2 font-bold text-xl text-primary">
            <Sparkles className="w-6 h-6" />
            <span>AI Platform</span>
          </Link>
        </div>
        
        <nav className="flex-1 px-4 space-y-1">
          {navigation.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              activeProps={{ className: 'bg-primary/10 text-primary' }}
              className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-muted-foreground hover:bg-accent transition-colors"
            >
              <item.icon className="w-4 h-4" />
              {item.name}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
              <User className="w-4 h-4 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">Demo User</p>
              <p className="text-xs text-muted-foreground truncate">Free Plan</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto relative">
        <Outlet />
      </main>
    </div>
  )
}
