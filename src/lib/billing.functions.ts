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
  freePlanUsed: boolean;
};

export type RenewPlanResult =
  | { ok: true; credits: number; expires_at: string; plan: string }
  | { ok: false; message: string };

export type SubscriberCreditAccount = {
  id: string;
  email: string | null;
  full_name: string | null;
  credits: number;
  updated_at: string;
};

async function requireAdmin(context: {
  supabase: Parameters<typeof hasAdminRole>[0];
  userId: string;
}) {
  const allowed = await hasAdminRole(context.supabase, context.userId);
  if (!allowed) throw new Error("Acesso restrito a administradores");
}

async function hasAdminRole(
  supabase: {
    rpc: (name: "has_role", args: { _user_id: string; _role: "admin" }) => PromiseLike<{
      data: boolean | null;
      error: { message: string } | null;
    }>;
  },
  userId: string,
) {
  const { data, error } = await supabase.rpc("has_role", { _user_id: userId, _role: "admin" });
  if (error) throw new Error(error.message);
  return data === true;
}

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
      supabase
        .from("subscriptions")
        .select("id, plans!inner(price_cents)")
        .eq("user_id", userId)
        .eq("plans.price_cents", 0)
        .limit(1),
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
      freePlanUsed: (freeRes.data ?? []).length > 0,
    };
  });

export const renewPlanFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { code: string }) => z.object({ code: z.string() }).parse(data))
  .handler(async ({ context, data }): Promise<RenewPlanResult> => {
    const { data: result, error } = await context.supabase.rpc("renew_plan", {
      _plan_code: data.code,
    });
    if (error) return { ok: false, message: error.message };
    const value = result as { credits: number; expires_at: string; plan: string };
    return { ok: true, ...value };
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

export const listSubscribersFn = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { search?: string }) =>
    z.object({ search: z.string().trim().max(120).optional() }).parse(data),
  )
  .handler(async ({ context, data }): Promise<SubscriberCreditAccount[]> => {
    await requireAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: subscribers, error } = await supabaseAdmin.rpc("admin_list_subscribers", {
      _admin_id: context.userId,
      _search: data.search ?? "",
    });
    if (error) throw new Error(error.message);
    return (subscribers ?? []) as SubscriberCreditAccount[];
  });

export const adjustSubscriberCreditsFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { userId: string; amount: number; reason: string }) =>
    z
      .object({
        userId: z.string().uuid(),
        amount: z.number().int().min(-1000000).max(1000000).refine((value) => value !== 0),
        reason: z.string().trim().min(3).max(200),
      })
      .parse(data),
  )
  .handler(async ({ context, data }) => {
    await requireAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: result, error } = await supabaseAdmin.rpc("admin_adjust_credits", {
      _admin_id: context.userId,
      _user_id: data.userId,
      _amount: data.amount,
      _reason: data.reason,
    });
    if (error) throw new Error(error.message);
    return result as { user_id: string; amount: number; credits: number };
  });
