import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  consumeCreditsFn,
  getBillingStateFn,
  renewPlanFn,
  type BillingState,
} from "@/lib/billing.functions";

export const billingQueryKey = ["billing-state"] as const;

export function useBilling() {
  const getState = useServerFn(getBillingStateFn);

  return useQuery<BillingState>({
    queryKey: billingQueryKey,
    queryFn: () => getState(),
    staleTime: 10_000,
  });
}

export function useCostFor(operation: string) {
  const { data } = useBilling();
  const cost = data?.costs.find((c) => c.operation === operation)?.credits ?? 0;
  return { cost, balance: data?.credits ?? 0, enough: (data?.credits ?? 0) >= cost };
}

export function useConsumeCredits() {
  const consume = useServerFn(consumeCreditsFn);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (operation: string) => consume({ data: { operation } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: billingQueryKey }),
  });
}

export function useRefreshBilling() {
  const qc = useQueryClient();
  return () => qc.invalidateQueries({ queryKey: billingQueryKey });
}

export function useRenewPlan() {
  const renew = useServerFn(renewPlanFn);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (code: string) => renew({ data: { code } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: billingQueryKey }),
  });
}

export function formatBRL(cents: number) {
  return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}
