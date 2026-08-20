import { Loader2, Download, Heart, Trash2, PlayCircle, Image as ImageIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useAIGenerator } from './AIGeneratorContext'
import { toast } from 'sonner'

export function GeneratedResults() {
  const { history, transferToTab } = useAIGenerator();

  const handleDownload = (url: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = `generation-${Date.now()}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Download started");
  };

  return (
    <div className="h-[calc(100vh-180px)] border rounded-xl flex flex-col bg-card overflow-hidden">
      <div className="p-4 border-b bg-card flex items-center justify-between">
        <h3 className="font-bold">Generated Results</h3>
        <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full font-medium">
          {history.length} Total
        </span>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          {history.length === 0 && (
            <div className="text-center py-20 text-muted-foreground">
              <p className="text-sm">No generations yet.</p>
              <p className="text-xs">Your creations will appear here.</p>
            </div>
          )}
          
          {history.map((result) => (
            <div key={result.id} className="group space-y-3">
              <div className="relative aspect-video rounded-lg overflow-hidden border bg-muted">
                {result.status === 'processing' || result.status === 'queued' ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    <span className="text-xs font-medium">Processing...</span>
                  </div>
                ) : (
                  <>
                    {result.type === 'image' ? (
                      <img src={result.url!} alt={result.prompt} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-black/10">
                        <PlayCircle className="w-12 h-12 text-primary" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <Button variant="secondary" size="icon" className="h-8 w-8" onClick={() => handleDownload(result.url!)}>
                        <Download className="w-4 h-4" />
                      </Button>
                      <Button variant="secondary" size="icon" className="h-8 w-8">
                        <Heart className="w-4 h-4" />
                      </Button>
                      {result.type === 'image' && (
                        <Button variant="secondary" size="icon" className="h-8 w-8" onClick={() => transferToTab('i2v', result.prompt, result.url)}>
                          <PlayCircle className="w-4 h-4" />
                        </Button>
                      )}
                      <Button variant="destructive" size="icon" className="h-8 w-8">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </>
                )}
              </div>
              
              <div className="space-y-1">
                <p className="text-sm font-medium line-clamp-2">{result.prompt}</p>
                <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                  <span className="uppercase tracking-wider font-bold flex items-center gap-1">
                    {result.type === 'image' ? <ImageIcon className="w-3 h-3" /> : <PlayCircle className="w-3 h-3" />}
                    {result.type === 'i2v' ? 'ANIMATION' : result.type}
                  </span>
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
