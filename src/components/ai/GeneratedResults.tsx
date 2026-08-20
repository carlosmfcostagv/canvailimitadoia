import { Loader2, Download, Heart, Trash2, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'

export function GeneratedResults() {
  const results = [
    {
      id: 1,
      type: 'image',
      status: 'completed',
      url: 'https://images.unsplash.com/photo-1614728263952-84ea256f9679?w=800&auto=format&fit=crop',
      prompt: 'Astronaut in a garden of glowing flowers on Mars',
      date: '2 mins ago'
    },
    {
      id: 2,
      type: 'video',
      status: 'processing',
      url: null,
      prompt: 'Cyberpunk city flyover with flying cars',
      date: 'Just now'
    }
  ]

  return (
    <div className="h-[calc(100vh-180px)] border rounded-xl flex flex-col bg-card overflow-hidden">
      <div className="p-4 border-b bg-card flex items-center justify-between">
        <h3 className="font-bold">Generated Results</h3>
        <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full font-medium">
          {results.length} Total
        </span>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          {results.map((result) => (
            <div key={result.id} className="group space-y-3">
              <div className="relative aspect-video rounded-lg overflow-hidden border bg-muted">
                {result.status === 'processing' ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    <span className="text-xs font-medium">Processing...</span>
                  </div>
                ) : (
                  <>
                    <img src={result.url!} alt={result.prompt} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <Button variant="secondary" size="icon" className="h-8 w-8"><Download className="w-4 h-4" /></Button>
                      <Button variant="secondary" size="icon" className="h-8 w-8"><Heart className="w-4 h-4" /></Button>
                      <Button variant="secondary" size="icon" className="h-8 w-8"><ExternalLink className="w-4 h-4" /></Button>
                      <Button variant="destructive" size="icon" className="h-8 w-8"><Trash2 className="w-4 h-4" /></Button>
                    </div>
                  </>
                )}
              </div>
              
              <div className="space-y-1">
                <p className="text-sm font-medium line-clamp-2">{result.prompt}</p>
                <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                  <span className="uppercase tracking-wider font-bold">{result.type}</span>
                  <span>{result.date}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}
