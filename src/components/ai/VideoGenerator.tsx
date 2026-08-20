import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Wand2, PlayCircle } from 'lucide-react'
import { useAIGenerator } from './AIGeneratorContext'
import { useServerFn } from '@tanstack/react-start'
import { enhancePromptFn, generateVideoFn } from '@/lib/ai.functions'
import { toast } from 'sonner'

export function VideoGenerator() {
  const { sharedPrompt, addToHistory } = useAIGenerator();
  const [prompt, setPrompt] = useState(sharedPrompt || '');
  const [loading, setLoading] = useState(false);
  
  const enhancePrompt = useServerFn(enhancePromptFn);
  const generateVideo = useServerFn(generateVideoFn);

  useEffect(() => {
    if (sharedPrompt) setPrompt(sharedPrompt);
  }, [sharedPrompt]);

  const handleEnhance = async () => {
    if (!prompt) return;
    try {
      const enhanced = await enhancePrompt({ data: { prompt } });
      setPrompt(enhanced);
      toast.success("Prompt enhanced!");
    } catch (e) {
      toast.error("Failed to enhance prompt");
    }
  };

  const handleGenerate = async () => {
    if (!prompt) {
      toast.error("Please enter a prompt");
      return;
    }
    setLoading(true);
    try {
      const result = await generateVideo({ data: { prompt, settings: {} } });
      addToHistory(result);
      toast.success("Video generation started!");
    } catch (e) {
      toast.error("Generation failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="text-center space-y-2 mb-8">
        <h2 className="text-2xl font-bold">Text to Video Generator</h2>
        <p className="text-muted-foreground">Create stunning videos from text descriptions.</p>
      </div>

      <div className="grid gap-6">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label htmlFor="video-prompt">Video Prompt</Label>
            <Button variant="ghost" size="sm" className="h-8 gap-2 text-primary" onClick={handleEnhance}>
              <Wand2 className="w-3.5 h-3.5" />
              Enhance
            </Button>
          </div>
          <Textarea 
            id="video-prompt"
            placeholder="Describe the video you want to create..."
            className="min-h-[120px] text-base resize-none"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs">Model</Label>
            <select className="w-full h-9 rounded-md border bg-background px-3 text-sm">
              <option>Luma Dream Machine</option>
              <option>Runway Gen-3</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Duration</Label>
            <select className="w-full h-9 rounded-md border bg-background px-3 text-sm">
              <option>5s</option>
              <option>10s</option>
            </select>
          </div>
        </div>

        <Button size="lg" className="w-full gap-2 h-14 text-lg" onClick={handleGenerate} disabled={loading}>
          <PlayCircle className="w-5 h-5" />
          {loading ? 'Generating...' : 'GENERATE VIDEO'}
        </Button>
      </div>
    </div>
  )
}
