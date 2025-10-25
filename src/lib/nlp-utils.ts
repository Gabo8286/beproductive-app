// NLP utilities stub - temporarily disabled
import { TaskExtractionResult } from '@/lib/ai-service';

export const extractKeywords = (text: string) => [];
export const analyzeSentiment = (text: string) => ({ score: 0, comparative: 0 });
export const extractDates = (text: string) => [];
export const tokenize = (text: string) => [];

export const nlpProcessor = {
  parseTaskFromText: (text: string): TaskExtractionResult => ({
    title: text.slice(0, 50),
    confidence: 0.5
  }),
  extractActionItems: (text: string): string[] => [text]
};
