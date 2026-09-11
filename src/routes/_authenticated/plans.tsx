import { createFileRoute } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { Check, CreditCard, MessageCircle } from 'lucide-react'
import { toast } from 'sonner'
import { formatBRL, useBilling, useRenewPlan } from '@/hooks/useBilling'

export const Route = createFileRoute('/_authenticated/plans')({
  component: PlansPage,
  head: () => ({
    title: 'Planos e Créditos | AI Generator',
    meta: [
      { name: 'description', content: 'Escolha ou renove seu plano e acompanhe o saldo de créditos de geração.' },
      { property: 'og:title', content: 'Planos e Créditos | AI Generator' },
      { property: 'og:description', content: 'Planos a partir de R$ 0,00 com créditos para gerar imagens e vídeos.' },
      { property: 'og:type', content: 'website' },
      { name: 'twitter:card', content: 'summary_large_image' },
    ],
  }),
})

const WHATSAPP_NUMBER = '5533999604603'

function PlansPage() {
  const { data, isLoading } = useBilling()
  const renew = useRenewPlan()

  const handleRenew = async (code: string) => {
    try {
      const result = await renew.mutateAsync(code)
      if (!result.ok) {
        toast.error(result.message)
        return
      }
      toast.success(
        `${result.plan} ativado. Saldo: ${result.credits} créditos, válido até ${new Date(
          result.expires_at,
        ).toLocaleDateString('pt-BR')}.`,
      )
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Não foi possível renovar')
    }
  }

  const openWhatsApp = (planName: string, price: string, credits: number) => {
    const message = `Olá! Quero contratar o plano ${planName} (${price} - ${credits} créditos).`
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Planos e Créditos</h1>
        <p className="text-muted-foreground">
          Renove a qualquer momento: os dias são somados ao seu vencimento atual.
        </p>
      </header>

      <div className="rounded-xl border bg-card p-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">Seu saldo atual</p>
          <p className="text-3xl font-bold">{data?.credits ?? 0} créditos</p>
        </div>
        {data?.subscription && (
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Plano atual</p>
            <p className="font-semibold">{data.subscription.plan_name}</p>
            <p className="text-sm text-muted-foreground">
              Vence em {new Date(data.subscription.expires_at).toLocaleDateString('pt-BR')}
            </p>
          </div>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {isLoading && <p className="text-muted-foreground">Carregando planos...</p>}
        {(data?.plans ?? [])
          .filter((p) => p.is_active)
          .map((plan) => (
            <div key={plan.id} className="rounded-xl border bg-card p-6 flex flex-col gap-4 shadow-sm">
              <div>
                <h2 className="text-lg font-semibold">{plan.name}</h2>
                <p className="text-3xl font-bold mt-2">{formatBRL(plan.price_cents)}</p>
              </div>
              <ul className="space-y-2 text-sm text-muted-foreground flex-1">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-primary" /> {plan.credits} créditos
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-primary" /> Validade de {plan.validity_days} dias
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-primary" /> Renovação soma dias e créditos
                </li>
              </ul>
              <Button
                className="w-full gap-2"
                disabled={
                  plan.price_cents === 0 && (renew.isPending || Boolean(data?.freePlanUsed))
                }
                onClick={() =>
                  plan.price_cents === 0
                    ? handleRenew(plan.code)
                    : openWhatsApp(plan.name, formatBRL(plan.price_cents), plan.credits)
                }
              >
                {plan.price_cents === 0 ? (
                  <CreditCard className="w-4 h-4" />
                ) : (
                  <MessageCircle className="w-4 h-4" />
                )}
                {plan.price_cents === 0
                  ? data?.freePlanUsed
                    ? 'Plano grátis já utilizado'
                    : 'Ativar plano grátis'
                  : 'Comprar via WhatsApp'}
              </Button>
            </div>
          ))}
      </div>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Custo das gerações</h2>
        <div className="rounded-xl border bg-card divide-y">
          {(data?.costs ?? []).map((c) => (
            <div key={c.id} className="flex items-center justify-between px-4 py-3">
              <span>{c.label}</span>
              <span className="font-medium">
                {c.credits} {c.credits === 1 ? 'crédito' : 'créditos'}
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
