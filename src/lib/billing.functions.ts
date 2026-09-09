import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type Plan = {
  id: string;
  code: string;
  name: string;
  price_cents: number;
  validity_days: number;
  credits: number;
  is_active: boolean;
  sort_order: number;
};

export type GenerationCost = {
  id: string;
  operation: string;
  label: string;
  credits: number;
};

export type BillingState = {
  credits: number;
  isAdmin: boolean;
  plans: Plan[];
  costs: GenerationCost[];
  subscription: { plan_name: string; expires_at: string } | null;
};

export const getBillingStateFn = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<BillingState> => {
    const { supabase, userId } = context;

    await supabase.rpc("bootstrap_user");

    const [profileRes, plansRes, costsRes, subRes, rolesRes] = await Promise.all([
      supabase.from("profiles").select("credits").eq("id", userId).maybeSingle(),
      supabase.from("plans").select("*").order("sort_order"),
      supabase.from("generation_costs").select("*").order("label"),
      supabase
        .from("subscriptions")
        .select("expires_at, plans(name)")
        .eq("user_id", userId)
        .eq("status", "active")
        .order("expires_at", { ascending: false })
        .limit(1),
      supabase.from("user_roles").select("role").eq("user_id", userId),
    ]);

    const sub = subRes.data?.[0] as { expires_at: string; plans: { name: string } | null } | undefined;

    return {
      credits: profileRes.data?.credits ?? 0,
      isAdmin: (rolesRes.data ?? []).some((r) => r.role === "admin"),
      plans: (plansRes.data ?? []) as Plan[],
      costs: (costsRes.data ?? []) as GenerationCost[],
      subscription: sub
        ? { plan_name: sub.plans?.name ?? "Plano", expires_at: sub.expires_at }
        : null,
    };
  });

export const renewPlanFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { code: string }) => z.object({ code: z.string() }).parse(data))
  .handler(async ({ context, data }) => {
    const { data: result, error } = await context.supabase.rpc("renew_plan", {
      _plan_code: data.code,
    });
    if (error) throw new Error(error.message);
    return result as { credits: number; expires_at: string; plan: string };
  });

export const consumeCreditsFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { operation: string }) =>
    z.object({ operation: z.string() }).parse(data),
  )
  .handler(async ({ context, data }) => {
    const { data: result, error } = await context.supabase.rpc("consume_credits", {
      _operation: data.operation,
    });
    if (error) throw new Error(error.message);
    return result as { cost: number; credits: number };
  });

export const updatePlanFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: {
    id: string;
    price_cents: number;
    credits: number;
    validity_days: number;
    is_active: boolean;
  }) =>
    z
      .object({
        id: z.string(),
        price_cents: z.number().int().min(0),
        credits: z.number().int().min(0),
        validity_days: z.number().int().min(1),
        is_active: z.boolean(),
      })
      .parse(data),
  )
  .handler(async ({ context, data }) => {
    const { id, ...fields } = data;
    const { error } = await context.supabase
      .from("plans")
      .update({ ...fields, updated_at: new Date().toISOString() })
      .eq("id", id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const updateCostFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { id: string; credits: number }) =>
    z.object({ id: z.string(), credits: z.number().int().min(0) }).parse(data),
  )
  .handler(async ({ context, data }) => {
    const { error } = await context.supabase
      .from("generation_costs")
      .update({ credits: data.credits, updated_at: new Date().toISOString() })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
