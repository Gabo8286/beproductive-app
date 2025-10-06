// AI service stub - temporarily disabled
export const generateInsight = async (prompt: string) => {
  return { title: 'Sample Insight', content: 'AI service temporarily disabled' };
};

export const analyzeText = async (text: string) => {
  return { sentiment: 'neutral', keywords: [] };
};

export default { generateInsight, analyzeText };
