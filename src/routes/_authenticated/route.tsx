import { createFileRoute, Link, Outlet, redirect, useNavigate } from '@tanstack/react-router'
import {
  LayoutDashboard,
  Sparkles,
  Settings,
  History,
  User,
  CreditCard,
  ShieldCheck,
  Zap,
  LogOut,
} from 'lucide-react'
import { supabase } from '@/integrations/supabase/client'
import { useBilling } from '@/hooks/useBilling'
import { Button } from '@/components/ui/button'

export const Route = createFileRoute('/_authenticated')({
  ssr: false,
  beforeLoad: async () => {
    const { data, error } = await supabase.auth.getUser()
    if (error || !data.user) throw redirect({ to: '/auth' })
    return { user: data.user }
  },
  component: AuthenticatedLayout,
})

function AuthenticatedLayout() {
  const navigate = useNavigate()
  const { data: billing } = useBilling()

  const navigation = [
    { name: 'AI Generator', href: '/ai-generator', icon: Sparkles },
    { name: 'Planos e Créditos', href: '/plans', icon: CreditCard },
  ] as const

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    navigate({ to: '/auth' })
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-card flex-col hidden md:flex">
        <div className="p-6">
          <Link to="/" className="flex items-center gap-2 font-bold text-xl text-primary">
            <Sparkles className="w-6 h-6" />
            <span>AI Platform</span>
          </Link>
        </div>

        <nav className="flex-1 px-4 space-y-1 overflow-auto">
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
          {billing?.isAdmin && (
            <Link
              to="/admin"
              activeProps={{ className: 'bg-primary/10 text-primary' }}
              className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-muted-foreground hover:bg-accent transition-colors"
            >
              <ShieldCheck className="w-4 h-4" />
              Administração
            </Link>
          )}
        </nav>

        <div className="p-4 border-t space-y-3">
          <Link
            to="/plans"
            className="block rounded-lg border bg-muted/40 px-3 py-2 hover:bg-accent transition-colors"
          >
            <p className="text-xs text-muted-foreground">Seu saldo</p>
            <p className="text-lg font-bold">{billing?.credits ?? 0} créditos</p>
            {billing?.subscription && (
              <p className="text-[11px] text-muted-foreground">
                {billing.subscription.plan_name} até{' '}
                {new Date(billing.subscription.expires_at).toLocaleDateString('pt-BR')}
              </p>
            )}
          </Link>

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
              <User className="w-4 h-4 text-primary" />
            </div>
            <Button variant="ghost" size="sm" className="flex-1 justify-start gap-2" onClick={handleSignOut}>
              <LogOut className="w-4 h-4" />
              Sair
            </Button>
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
