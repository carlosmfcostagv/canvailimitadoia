import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Wand2, Image as ImageIcon } from 'lucide-react'
import { useAIGenerator } from './AIGeneratorContext'
import { useServerFn } from '@tanstack/react-start'
import { enhancePromptFn, generateImageFn } from '@/lib/ai.functions'
import { toast } from 'sonner'
import { CreditNotice } from '@/components/billing/CreditNotice'
import { useCostFor, useRefreshBilling } from '@/hooks/useBilling'

export function ImageGenerator() {
  const { sharedPrompt, addToHistory } = useAIGenerator();
  const [prompt, setPrompt] = useState(sharedPrompt || '');
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    model: 'Stable Diffusion XL',
    aspectRatio: '1:1 Square',
    style: 'Photorealistic',
    count: '1 image'
  });
  
  const enhancePrompt = useServerFn(enhancePromptFn);
  const generateImage = useServerFn(generateImageFn);
  const { cost, enough } = useCostFor('image');
  const refreshBilling = useRefreshBilling();

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
    if (!enough) {
      toast.error(`Créditos insuficientes. Esta geração custa ${cost} créditos.`);
      return;
    }
    setLoading(true);
    try {
      const result = await generateImage({ data: { prompt, settings } });
      addToHistory(result);
      await refreshBilling();
      toast.success(`Image generated! -${cost} créditos`);
    } catch (e) {
      await refreshBilling();
      toast.error(e instanceof Error ? e.message : "Generation failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="text-center space-y-2 mb-8">
        <h2 className="text-2xl font-bold">Text to Image Generator</h2>
        <p className="text-muted-foreground">Turn your ideas into high-quality images with AI.</p>
      </div>

      <div className="grid gap-6">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label htmlFor="image-prompt">Visual Prompt</Label>
            <Button variant="ghost" size="sm" className="h-8 gap-2 text-primary" onClick={handleEnhance}>
              <Wand2 className="w-3.5 h-3.5" />
              Enhance
            </Button>
          </div>
          <Textarea 
            id="image-prompt"
            placeholder="Describe the image you want to create..."
            className="min-h-[120px] text-base resize-none"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs">Model</Label>
            <select 
              className="w-full h-9 rounded-md border bg-background px-3 text-sm"
              value={settings.model}
              onChange={(e) => setSettings({...settings, model: e.target.value})}
            >
              <option>Stable Diffusion XL</option>
              <option>Flux.1</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Aspect Ratio</Label>
            <select 
              className="w-full h-9 rounded-md border bg-background px-3 text-sm"
              value={settings.aspectRatio}
              onChange={(e) => setSettings({...settings, aspectRatio: e.target.value})}
            >
              <option>1:1 Square</option>
              <option>16:9 Landscape</option>
              <option>9:16 Portrait</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Style</Label>
            <select 
              className="w-full h-9 rounded-md border bg-background px-3 text-sm"
              value={settings.style}
              onChange={(e) => setSettings({...settings, style: e.target.value})}
            >
              <option>Photorealistic</option>
              <option>Cinematic</option>
              <option>Digital Art</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Count</Label>
            <select 
              className="w-full h-9 rounded-md border bg-background px-3 text-sm"
              value={settings.count}
              onChange={(e) => setSettings({...settings, count: e.target.value})}
            >
              <option>1 image</option>
              <option>2 images</option>
            </select>
          </div>
        </div>

        <CreditNotice operation="image" />

        <Button size="lg" className="w-full gap-2 h-14 text-lg" onClick={handleGenerate} disabled={loading || !enough}>
          <ImageIcon className="w-5 h-5" />
          {loading ? 'Generating...' : !enough ? 'CRÉDITOS INSUFICIENTES' : 'GENERATE IMAGE'}
        </Button>
      </div>
    </div>
  )
}
