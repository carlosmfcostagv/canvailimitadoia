import { createFileRoute } from '@tanstack/react-router'
import { AIGeneratorContainer } from '@/components/ai/AIGeneratorContainer'

export const Route = createFileRoute('/_authenticated/ai-generator')({
  component: AIGeneratorPage,
  head: () => ({
    title: 'AI Generator | Platform',
    meta: [
      { name: 'description', content: 'Create professional images, videos, and prompts with AI using our advanced generator tools.' },
      { property: 'og:title', content: 'AI Generator | Platform' },
      { property: 'og:description', content: 'Create professional images, videos, and prompts with AI.' },
      { property: 'og:type', content: 'website' },
      { name: 'twitter:card', content: 'summary_large_image' },
    ],
  }),
})

function AIGeneratorPage() {
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">AI Generator</h1>
        <p className="text-muted-foreground">Create professional images, videos, and prompts with AI.</p>
      </header>
      
      <AIGeneratorContainer />
    </div>
  )
}
