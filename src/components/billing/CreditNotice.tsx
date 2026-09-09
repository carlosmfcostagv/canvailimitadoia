import { Link } from '@tanstack/react-router'
import { AlertCircle, Coins } from 'lucide-react'
import { useCostFor } from '@/hooks/useBilling'

export function CreditNotice({ operation }: { operation: string }) {
  const { cost, balance, enough } = useCostFor(operation)

  return (
    <div className="rounded-lg border bg-muted/40 px-4 py-3 flex flex-wrap items-center justify-between gap-2 text-sm">
      <span className="flex items-center gap-2">
        <Coins className="w-4 h-4 text-primary" />
        Custo desta geração: <strong>{cost} créditos</strong>
      </span>
      <span className={enough ? 'text-muted-foreground' : 'text-destructive flex items-center gap-1.5'}>
        {!enough && <AlertCircle className="w-4 h-4" />}
        Seu saldo: <strong>{balance} créditos</strong>
        {!enough && (
          <Link to="/plans" className="ml-2 underline font-medium">
            Renovar plano
          </Link>
        )}
      </span>
    </div>
  )
}
