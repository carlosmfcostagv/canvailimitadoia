import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ImageToVideo } from './ImageToVideo'
import { ImageGenerator } from './ImageGenerator'
import { VideoGenerator } from './VideoGenerator'
import { PromptGenerator } from './PromptGenerator'
import { GeneratedResults } from './GeneratedResults'
import { Settings2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AIGeneratorProvider, useAIGenerator, GenerationType } from './AIGeneratorContext'

function AIGeneratorInner() {
  const { activeTab, setActiveTab } = useAIGenerator();

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[1fr_400px] gap-8">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Tabs 
            value={activeTab} 
            onValueChange={(v) => setActiveTab(v as GenerationType)}
            className="w-full"
          >
            <div className="flex items-center justify-between mb-4">
              <TabsList className="bg-muted/50 p-1 border">
                <TabsTrigger value="i2v">Image to Video</TabsTrigger>
                <TabsTrigger value="image">Image Generator</TabsTrigger>
                <TabsTrigger value="video">Video Generator</TabsTrigger>
                <TabsTrigger value="prompt">Prompt Generator</TabsTrigger>
              </TabsList>
              
              <Button variant="outline" size="icon">
                <Settings2 className="w-4 h-4" />
              </Button>
            </div>

            <div className="bg-card rounded-xl border p-6 shadow-sm">
              <TabsContent value="i2v" className="mt-0">
                <ImageToVideo />
              </TabsContent>
              <TabsContent value="image" className="mt-0">
                <ImageGenerator />
              </TabsContent>
              <TabsContent value="video" className="mt-0">
                <VideoGenerator />
              </TabsContent>
              <TabsContent value="prompt" className="mt-0">
                <PromptGenerator />
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>

      <aside className="space-y-6">
        <GeneratedResults />
      </aside>
    </div>
  )
}

export function AIGeneratorContainer() {
  return (
    <AIGeneratorProvider>
      <AIGeneratorInner />
    </AIGeneratorProvider>
  )
}
