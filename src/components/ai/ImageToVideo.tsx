import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Upload, Wand2, PlayCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

export function ImageToVideo() {
  const [prompt, setPrompt] = useState('')
  const [image, setImage] = useState<string | null>(null)

  return (
    <div className="space-y-8">
      <div className="text-center space-y-2 mb-8">
        <h2 className="text-2xl font-bold">Image to Video Generator</h2>
        <p className="text-muted-foreground">Transform static images into cinematic AI-generated videos.</p>
      </div>

      <div className="grid gap-6">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label htmlFor="i2v-prompt">Animation Prompt</Label>
            <Button variant="ghost" size="sm" className="h-8 gap-2 text-primary">
              <Wand2 className="w-3.5 h-3.5" />
              Enhance
            </Button>
          </div>
          <Textarea 
            id="i2v-prompt"
            placeholder="Describe the movement, action, or animation you want to create..."
            className="min-h-[120px] text-base resize-none"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            Example: "The camera zooms in slowly while wind moves their hair."
          </p>
        </div>

        <div className="space-y-2">
          <Label>Reference Image</Label>
          <div className={cn(
            "border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center transition-colors cursor-pointer",
            image ? "bg-accent/20 border-accent" : "hover:bg-accent/10 border-muted"
          )}>
            {image ? (
              <div className="relative aspect-video w-full max-w-md rounded-lg overflow-hidden group">
                <img src={image} alt="Preview" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <Button variant="secondary" size="sm" onClick={() => setImage(null)}>Replace Image</Button>
                </div>
              </div>
            ) : (
              <div className="text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                  <Upload className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Click or drag image to upload</p>
                  <p className="text-xs text-muted-foreground">JPG, PNG, WEBP supported</p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs">Duration</Label>
            <select className="w-full h-9 rounded-md border bg-background px-3 text-sm">
              <option>5 seconds</option>
              <option>10 seconds</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Resolution</Label>
            <select className="w-full h-9 rounded-md border bg-background px-3 text-sm">
              <option>1080p</option>
              <option>2K</option>
              <option>4K</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Motion Score</Label>
            <select className="w-full h-9 rounded-md border bg-background px-3 text-sm">
              <option>Low</option>
              <option>Medium</option>
              <option>High</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Aspect Ratio</Label>
            <select className="w-full h-9 rounded-md border bg-background px-3 text-sm">
              <option>16:9</option>
              <option>9:16</option>
              <option>1:1</option>
            </select>
          </div>
        </div>

        <Button size="lg" className="w-full gap-2 h-14 text-lg">
          <PlayCircle className="w-5 h-5" />
          GENERATE VIDEO
        </Button>
      </div>
    </div>
  )
}
