import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Upload, Wand2, PlayCircle, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAIGenerator } from './AIGeneratorContext'
import { useServerFn } from '@tanstack/react-start'
import { enhancePromptFn, generateVideoFn } from '@/lib/ai.functions'
import { toast } from 'sonner'

export function ImageToVideo() {
  const { sharedPrompt, sharedImage, setSharedImage, addToHistory } = useAIGenerator();
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
    if (!sharedImage) {
      toast.error("Please upload an image first");
      return;
    }
    setLoading(true);
    try {
      const result = await generateVideo({ data: { prompt, settings: { type: 'i2v' } } });
      addToHistory({ ...result, type: 'i2v' });
      toast.success("Animation started!");
    } catch (e) {
      toast.error("Generation failed");
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSharedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

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
            <Button variant="ghost" size="sm" className="h-8 gap-2 text-primary" onClick={handleEnhance}>
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
        </div>

        <div className="space-y-2">
          <Label>Reference Image</Label>
          <div className={cn(
            "border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center transition-colors cursor-pointer relative",
            sharedImage ? "bg-accent/20 border-accent" : "hover:bg-accent/10 border-muted"
          )}>
            {sharedImage ? (
              <div className="relative aspect-video w-full max-w-md rounded-lg overflow-hidden group">
                <img src={sharedImage} alt="Preview" className="w-full h-full object-cover" />
                <Button 
                  variant="destructive" 
                  size="icon" 
                  className="absolute top-2 right-2 h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => setSharedImage(null)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <label className="text-center space-y-2 cursor-pointer w-full">
                <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                  <Upload className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Click to upload image</p>
                  <p className="text-xs text-muted-foreground">JPG, PNG, WEBP supported</p>
                </div>
              </label>
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
            <Label className="text-xs">Motion</Label>
            <select className="w-full h-9 rounded-md border bg-background px-3 text-sm">
              <option>Low</option>
              <option>Medium</option>
              <option>High</option>
            </select>
          </div>
        </div>

        <Button size="lg" className="w-full gap-2 h-14 text-lg" onClick={handleGenerate} disabled={loading}>
          <PlayCircle className="w-5 h-5" />
          {loading ? 'Processing...' : 'GENERATE VIDEO'}
        </Button>
      </div>
    </div>
  )
}
