import { useEffect, useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useServerFn } from '@tanstack/react-start'
import { Coins, Search, Trash2 } from 'lucide-react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { toast } from 'sonner'
import { billingQueryKey, useBilling } from '@/hooks/useBilling'
import {
  adjustSubscriberCreditsFn,
  deleteSubscriberFn,
  listSubscribersFn,
  updateCostFn,
  updatePlanFn,
  type GenerationCost,
  type Plan,
  type SubscriberCreditAccount,
} from '@/lib/billing.functions'

export const Route = createFileRoute('/_authenticated/admin')({
  component: AdminPage,
  head: () => ({
    title: 'Administração | AI Generator',
    meta: [
      { name: 'description', content: 'Ajuste preços, créditos, validade dos planos e o custo de cada geração.' },
      { property: 'og:title', content: 'Administração | AI Generator' },
      { property: 'og:description', content: 'Painel do administrador para planos e custos de geração.' },
      { property: 'og:type', content: 'website' },
      { name: 'twitter:card', content: 'summary_large_image' },
    ],
  }),
})

function AdminPage() {
  const { data, isLoading } = useBilling()
  const qc = useQueryClient()
  const updatePlan = useServerFn(updatePlanFn)
  const updateCost = useServerFn(updateCostFn)
  const listSubscribers = useServerFn(listSubscribersFn)
  const adjustCredits = useServerFn(adjustSubscriberCreditsFn)
  const [search, setSearch] = useState('')
  const subscribersQuery = useQuery({
    queryKey: ['admin-subscribers', search],
    queryFn: () => listSubscribers({ data: { search } }),
    enabled: data?.isAdmin === true,
  })

  const savePlan = useMutation({
    mutationFn: (p: Plan) =>
      updatePlan({
        data: {
          id: p.id,
          price_cents: p.price_cents,
          credits: p.credits,
          validity_days: p.validity_days,
          is_active: p.is_active,
        },
      }),
    onSuccess: () => {
      toast.success('Plano atualizado')
      qc.invalidateQueries({ queryKey: billingQueryKey })
    },
    onError: (e: Error) => toast.error(e.message),
  })

  const saveCost = useMutation({
    mutationFn: (c: GenerationCost) => updateCost({ data: { id: c.id, credits: c.credits } }),
    onSuccess: () => {
      toast.success('Custo atualizado')
      qc.invalidateQueries({ queryKey: billingQueryKey })
    },
    onError: (e: Error) => toast.error(e.message),
  })

  const adjustBalance = useMutation({
    mutationFn: (input: { userId: string; amount: number; reason: string }) =>
      adjustCredits({ data: input }),
    onSuccess: () => {
      toast.success('Créditos atualizados e registrados no histórico')
      qc.invalidateQueries({ queryKey: ['admin-subscribers'] })
      qc.invalidateQueries({ queryKey: billingQueryKey })
    },
    onError: (e: Error) => toast.error(e.message),
  })

  if (isLoading) return <div className="p-6 text-muted-foreground">Carregando...</div>

  if (!data?.isAdmin) {
    return (
      <div className="p-6 max-w-xl mx-auto">
        <h1 className="text-2xl font-bold">Acesso restrito</h1>
        <p className="text-muted-foreground mt-2">
          Esta área é exclusiva para administradores.
        </p>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-10">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Administração</h1>
        <p className="text-muted-foreground">Altere preços, créditos, validade e custos sem mexer no código.</p>
      </header>

      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold">Créditos dos assinantes</h2>
          <p className="text-sm text-muted-foreground">Localize uma conta e libere ou retire créditos.</p>
        </div>
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="pl-9"
            placeholder="Buscar por nome ou e-mail"
            aria-label="Buscar assinante"
          />
        </div>
        {subscribersQuery.isLoading && <p className="text-sm text-muted-foreground">Carregando assinantes...</p>}
        {subscribersQuery.isError && (
          <p className="text-sm text-destructive">Não foi possível carregar os assinantes.</p>
        )}
        <div className="space-y-3">
          {(subscribersQuery.data ?? []).map((subscriber) => (
            <SubscriberCreditRow
              key={subscriber.id}
              subscriber={subscriber}
              saving={adjustBalance.isPending}
              onSave={(amount, reason) =>
                adjustBalance.mutate({ userId: subscriber.id, amount, reason })
              }
            />
          ))}
        </div>
        {subscribersQuery.data?.length === 0 && (
          <p className="text-sm text-muted-foreground">Nenhum assinante encontrado.</p>
        )}
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Planos</h2>
        {data.plans.map((plan) => (
          <PlanRow key={plan.id} plan={plan} onSave={(p) => savePlan.mutate(p)} saving={savePlan.isPending} />
        ))}
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Custo das gerações</h2>
        {data.costs.map((cost) => (
          <CostRow key={cost.id} cost={cost} onSave={(c) => saveCost.mutate(c)} saving={saveCost.isPending} />
        ))}
      </section>
    </div>
  )
}

function SubscriberCreditRow({
  subscriber,
  saving,
  onSave,
}: {
  subscriber: SubscriberCreditAccount
  saving: boolean
  onSave: (amount: number, reason: string) => void
}) {
  const [amount, setAmount] = useState(0)
  const [reason, setReason] = useState('')

  const submit = () => {
    if (amount === 0) {
      toast.error('Informe uma quantidade diferente de zero')
      return
    }
    if (reason.trim().length < 3) {
      toast.error('Informe o motivo do ajuste')
      return
    }
    onSave(amount, reason.trim())
    setAmount(0)
    setReason('')
  }

  return (
    <div className="rounded-xl border bg-card p-4 space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-medium">{subscriber.full_name || 'Assinante'}</p>
          <p className="text-sm text-muted-foreground">{subscriber.email || 'E-mail não informado'}</p>
        </div>
        <div className="flex items-center gap-2 font-semibold">
          <Coins className="h-4 w-4 text-primary" />
          {subscriber.credits} créditos
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-[140px_1fr_auto] sm:items-end">
        <div className="space-y-1.5">
          <Label className="text-xs">Quantidade</Label>
          <Input
            type="number"
            value={amount}
            onChange={(event) => setAmount(Number(event.target.value || 0))}
            aria-label={`Quantidade para ${subscriber.email || subscriber.full_name || 'assinante'}`}
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Motivo</Label>
          <Input
            value={reason}
            maxLength={200}
            onChange={(event) => setReason(event.target.value)}
            placeholder="Ex.: pagamento confirmado"
            aria-label={`Motivo do ajuste para ${subscriber.email || subscriber.full_name || 'assinante'}`}
          />
        </div>
        <Button disabled={saving || amount === 0 || reason.trim().length < 3} onClick={submit}>
          {amount > 0 ? 'Liberar créditos' : 'Retirar créditos'}
        </Button>
      </div>
    </div>
  )
}

function PlanRow({ plan, onSave, saving }: { plan: Plan; onSave: (p: Plan) => void; saving: boolean }) {
  const [draft, setDraft] = useState(plan)
  useEffect(() => setDraft(plan), [plan])

  return (
    <div className="rounded-xl border bg-card p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">{plan.name}</h3>
        <div className="flex items-center gap-2">
          <Label htmlFor={`active-${plan.id}`} className="text-xs text-muted-foreground">
            Ativo
          </Label>
          <Switch
            id={`active-${plan.id}`}
            checked={draft.is_active}
            onCheckedChange={(v) => setDraft({ ...draft, is_active: v })}
          />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-1.5">
          <Label className="text-xs">Preço (R$)</Label>
          <Input
            type="number"
            step="0.01"
            min="0"
            value={(draft.price_cents / 100).toFixed(2)}
            onChange={(e) =>
              setDraft({ ...draft, price_cents: Math.round(Number(e.target.value || 0) * 100) })
            }
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Créditos</Label>
          <Input
            type="number"
            min="0"
            value={draft.credits}
            onChange={(e) => setDraft({ ...draft, credits: Number(e.target.value || 0) })}
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Validade (dias)</Label>
          <Input
            type="number"
            min="1"
            value={draft.validity_days}
            onChange={(e) => setDraft({ ...draft, validity_days: Number(e.target.value || 1) })}
          />
        </div>
      </div>
      <Button size="sm" disabled={saving} onClick={() => onSave(draft)}>
        Salvar plano
      </Button>
    </div>
  )
}

function CostRow({
  cost,
  onSave,
  saving,
}: {
  cost: GenerationCost
  onSave: (c: GenerationCost) => void
  saving: boolean
}) {
  const [credits, setCredits] = useState(cost.credits)
  useEffect(() => setCredits(cost.credits), [cost])

  return (
    <div className="rounded-xl border bg-card p-4 flex flex-wrap items-end gap-4">
      <div className="flex-1 min-w-[160px]">
        <p className="font-medium">{cost.label}</p>
        <p className="text-xs text-muted-foreground">{cost.operation}</p>
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs">Créditos</Label>
        <Input
          type="number"
          min="0"
          className="w-28"
          value={credits}
          onChange={(e) => setCredits(Number(e.target.value || 0))}
        />
      </div>
      <Button size="sm" disabled={saving} onClick={() => onSave({ ...cost, credits })}>
        Salvar
      </Button>
    </div>
  )
}
