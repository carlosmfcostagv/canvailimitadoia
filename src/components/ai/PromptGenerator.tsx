import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { MessageSquare, Copy, Send, ImageIcon, VideoIcon, PlayCircle } from 'lucide-react'
import { useAIGenerator } from './AIGeneratorContext'
import { useServerFn } from '@tanstack/react-start'
import { generateStructuredPromptFn } from '@/lib/ai.functions'
import { toast } from 'sonner'

export function PromptGenerator() {
  const { transferToTab } = useAIGenerator();
  const [idea, setIdea] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  
  const generateStructured = useServerFn(generateStructuredPromptFn);

  const handleGenerate = async () => {
    if (!idea) return;
    setLoading(true);
    try {
      const data = await generateStructured({ data: { idea } });
      setResult(data);
      toast.success("Professional prompt generated!");
    } catch (e) {
      toast.error("Failed to generate prompt");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (result) {
      navigator.clipboard.writeText(result.mainPrompt);
      toast.success("Prompt copied to clipboard!");
    }
  };

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

        <Button size="lg" className="w-full gap-2 h-14 text-lg" onClick={handleGenerate} disabled={loading}>
          <Send className="w-5 h-5" />
          {loading ? 'Processing...' : 'GENERATE PROMPT'}
        </Button>

        {result && (
          <div className="space-y-4 pt-4 border-t animate-in fade-in slide-in-from-top-4">
            <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Generated Prompt</h3>
            <div className="bg-muted/30 rounded-lg p-4 relative border">
              <div className="space-y-3">
                <p className="text-sm leading-relaxed font-medium">{result.mainPrompt}</p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div><span className="text-muted-foreground">Style:</span> {result.style}</div>
                  <div><span className="text-muted-foreground">Lighting:</span> {result.lighting}</div>
                </div>
              </div>
              <Button variant="ghost" size="icon" className="absolute top-2 right-2" onClick={copyToClipboard}>
                <Copy className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="grid grid-cols-3 gap-2">
              <Button variant="outline" size="sm" className="gap-2" onClick={() => transferToTab('image', result.mainPrompt)}>
                <ImageIcon className="w-3.5 h-3.5" />
                To Image
              </Button>
              <Button variant="outline" size="sm" className="gap-2" onClick={() => transferToTab('video', result.mainPrompt)}>
                <VideoIcon className="w-3.5 h-3.5" />
                To Video
              </Button>
              <Button variant="outline" size="sm" className="gap-2" onClick={() => transferToTab('i2v', result.mainPrompt)}>
                <PlayCircle className="w-3.5 h-3.5" />
                To Anim
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
