import { createFileRoute, Link } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    title: "AI Generator | Imagens, vídeos e prompts com IA",
    meta: [
      {
        name: "description",
        content:
          "Gere imagens, vídeos e prompts profissionais com IA. Comece grátis com 10 créditos e renove quando quiser.",
      },
      { property: "og:title", content: "AI Generator | Imagens, vídeos e prompts com IA" },
      {
        property: "og:description",
        content: "Planos a partir de R$ 0,00. Gere imagens, vídeos e prompts com créditos.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});

function Index() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6">
      <div className="max-w-2xl text-center space-y-6">
        <div className="inline-flex items-center gap-2 text-primary font-bold text-xl">
          <Sparkles className="w-6 h-6" />
          AI Platform
        </div>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
          Crie imagens, vídeos e prompts com Inteligência Artificial
        </h1>
        <p className="text-lg text-muted-foreground">
          Comece grátis com 10 créditos. Depois escolha o plano de 15 dias por R$ 30,00 (50 créditos)
          ou o de 28 dias por R$ 49,90 (120 créditos).
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link
            to="/auth"
            className="inline-flex h-11 items-center rounded-md bg-primary px-6 font-medium text-primary-foreground hover:bg-primary/90"
          >
            Começar grátis
          </Link>
          <Link
            to="/ai-generator"
            className="inline-flex h-11 items-center rounded-md border px-6 font-medium hover:bg-accent"
          >
            Abrir o painel
          </Link>
        </div>
      </div>
    </div>
  );
}
