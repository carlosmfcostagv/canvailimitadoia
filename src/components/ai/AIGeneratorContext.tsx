import React, { createContext, useContext, useState, useCallback } from 'react';
import { toast } from 'sonner';

export type GenerationStatus = 'queued' | 'processing' | 'completed' | 'failed';
export type GenerationType = 'image' | 'video' | 'i2v' | 'prompt';

export interface GenerationResult {
  id: string;
  type: GenerationType;
  status: GenerationStatus;
  url?: string;
  prompt: string;
  date: string;
  settings?: any;
}

interface AIGeneratorContextType {
  activeTab: GenerationType;
  setActiveTab: (tab: GenerationType) => void;
  history: GenerationResult[];
  addToHistory: (result: GenerationResult) => void;
  sharedPrompt: string;
  setSharedPrompt: (prompt: string) => void;
  sharedImage: string | null;
  setSharedImage: (image: string | null) => void;
  transferToTab: (tab: GenerationType, prompt: string, image?: string | null) => void;
}

const AIGeneratorContext = createContext<AIGeneratorContextType | undefined>(undefined);

export function AIGeneratorProvider({ children }: { children: React.ReactNode }) {
  const [activeTab, setActiveTab] = useState<GenerationType>('i2v');
  const [history, setHistory] = useState<GenerationResult[]>([]);
  const [sharedPrompt, setSharedPrompt] = useState('');
  const [sharedImage, setSharedImage] = useState<string | null>(null);

  const addToHistory = useCallback((result: GenerationResult) => {
    setHistory(prev => [result, ...prev]);
  }, []);

  const transferToTab = useCallback((tab: GenerationType, prompt: string, image: string | null = null) => {
    setSharedPrompt(prompt);
    if (image) setSharedImage(image);
    setActiveTab(tab);
    toast.success(`Transferred to ${tab}`);
  }, []);

  return (
    <AIGeneratorContext.Provider value={{
      activeTab,
      setActiveTab,
      history,
      addToHistory,
      sharedPrompt,
      setSharedPrompt,
      sharedImage,
      setSharedImage,
      transferToTab
    }}>
      {children}
    </AIGeneratorContext.Provider>
  );
}

export const useAIGenerator = () => {
  const context = useContext(AIGeneratorContext);
  if (!context) throw new Error('useAIGenerator must be used within AIGeneratorProvider');
  return context;
};
