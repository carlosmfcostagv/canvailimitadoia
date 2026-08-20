import { createFileRoute, Navigate } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    title: 'AI Platform | Creative Suite',
    meta: [
      { name: 'description', content: 'The ultimate AI-powered creative platform for images, videos, and professional prompts.' },
      { property: 'og:title', content: 'AI Platform | Creative Suite' },
      { property: 'og:description', content: 'The ultimate AI-powered creative platform.' },
    ],
  }),
});

function Index() {
  return <Navigate to="/ai-generator" replace />;
}
