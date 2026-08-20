import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { MessageSquare, Copy, Send } from 'lucide-react'

export function PromptGenerator() {
  const [idea, setIdea] = useState('')

  return (
    <div className="space-y-8">
      <div className="text-center space-y-2 mb-8">
        <h2 className="text-2xl font-bold">AI Prompt Generator</h2>
        <p className="text-muted-foreground">Turn simple ideas into professional AI prompts.</p>
      </div>

      <div className="grid gap-6">
        <div className="space-y-2">
          <Label htmlFor="prompt-idea">Your Idea</Label>
          <Textarea 
            id="prompt-idea"
            placeholder="Describe your idea (e.g., A futuristic car in a neon city)..."
            className="min-h-[120px] text-base resize-none"
            value={idea}
            onChange={(e) => setIdea(e.target.value)}
          />
        </div>

        <Button size="lg" className="w-full gap-2 h-14 text-lg">
          <Send className="w-5 h-5" />
          GENERATE PROMPT
        </Button>

        <div className="space-y-4 pt-4 border-t">
          <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Generated Prompt</h3>
          <div className="bg-muted/30 rounded-lg p-4 relative border">
            <p className="text-sm leading-relaxed">
              Generate a high-detail cinematic shot of a futuristic sports car with glowing cyan neon lines driving through a rainy cyberpunk Tokyo street at night. The wet pavement reflects the vibrant pink and blue billboards. Ultra-realistic, 8k, volumetric lighting, unreal engine 5 render style.
            </p>
            <Button variant="ghost" size="icon" className="absolute top-2 right-2">
              <Copy className="w-4 h-4" />
            </Button>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" className="w-full gap-2">Use for Image</Button>
            <Button variant="outline" className="w-full gap-2">Use for Video</Button>
          </div>
        </div>
      </div>
    </div>
  )
}
