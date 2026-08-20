import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Wand2, Image as ImageIcon } from 'lucide-react'

export function ImageGenerator() {
  const [prompt, setPrompt] = useState('')

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
            <Button variant="ghost" size="sm" className="h-8 gap-2 text-primary">
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
            <select className="w-full h-9 rounded-md border bg-background px-3 text-sm">
              <option>Stable Diffusion XL</option>
              <option>Flux.1</option>
              <option>Midjourney v6</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Aspect Ratio</Label>
            <select className="w-full h-9 rounded-md border bg-background px-3 text-sm">
              <option>1:1 Square</option>
              <option>16:9 Landscape</option>
              <option>9:16 Portrait</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Style</Label>
            <select className="w-full h-9 rounded-md border bg-background px-3 text-sm">
              <option>Photorealistic</option>
              <option>Cinematic</option>
              <option>Digital Art</option>
              <option>Anime</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Count</Label>
            <select className="w-full h-9 rounded-md border bg-background px-3 text-sm">
              <option>1 image</option>
              <option>2 images</option>
              <option>4 images</option>
            </select>
          </div>
        </div>

        <Button size="lg" className="w-full gap-2 h-14 text-lg">
          <ImageIcon className="w-5 h-5" />
          GENERATE IMAGE
        </Button>
      </div>
    </div>
  )
}
