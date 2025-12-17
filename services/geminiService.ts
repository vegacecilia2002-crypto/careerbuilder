
import { GoogleGenAI, Type } from "@google/genai";

const getSafeApiKey = (): string => {
  if (typeof process !== 'undefined' && process.env) {
    return process.env.API_KEY || "";
  }
  const win = window as any;
  if (win._env_ && win._env_.API_KEY) return win._env_.API_KEY;
  if (win.process && win.process.env && win.process.env.API_KEY) return win.process.env.API_KEY;
  return "";
};

const getAIClient = () => {
  const apiKey = getSafeApiKey();
  return new GoogleGenAI({ apiKey });
};

export const generateCoverLetter = async (role: string, company: string, skills: string, jobDescription?: string): Promise<string> => {
  const prompt = `Write a professional cover letter for ${role} at ${company}. Skills: ${skills}. ${jobDescription ? `JD: ${jobDescription}` : ''}`;
  try {
    const ai = getAIClient();
    const response = await ai.models.generateContent({ model: 'gemini-3-flash-preview', contents: prompt });
    return response.text || "";
  } catch (error) { throw error; }
};

export const analyzeJobMatch = async (resume: any, jobDescription: string) => {
  const prompt = `
    Compare this resume with the following job description. 
    Provide a JSON response with:
    1. "score": number (0-100)
    2. "strengths": string[] (matching skills/experience)
    3. "gaps": string[] (missing keywords or skills)
    4. "advice": string (how to improve the resume for this specific JD)

    Resume: ${JSON.stringify(resume)}
    Job Description: ${jobDescription}
  `;
  try {
    const ai = getAIClient();
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });
    return JSON.parse(response.text || "{}");
  } catch (error) { throw error; }
};

export const findMatchingJobs = async (skills: string, location: string) => {
  const prompt = `Find 5 current, high-quality job openings for someone with these skills: ${skills}. Preferred location: ${location}. For each job, provide: Title, Company, Location, and a brief "Match Reason". Include the direct application URL.`;
  try {
    const ai = getAIClient();
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              company: { type: Type.STRING },
              location: { type: Type.STRING },
              url: { type: Type.STRING },
              source: { type: Type.STRING },
              matchReason: { type: Type.STRING }
            },
            required: ["title", "company", "url", "matchReason"]
          }
        }
      }
    });
    
    const results = JSON.parse(response.text || "[]");
    // Extract URLs from grounding metadata if JSON doesn't have them reliably
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    return results.map((job: any, i: number) => ({
      ...job,
      source: chunks[i]?.web?.title || job.source || "Web Search"
    }));
  } catch (error) { throw error; }
};

export const generateInterviewGuide = async (role: string, company: string, description?: string): Promise<string> => {
  const prompt = `Career coach guide for ${role} at ${company}. Context: ${description}`;
  try {
    const ai = getAIClient();
    const response = await ai.models.generateContent({ model: 'gemini-3-flash-preview', contents: prompt });
    return response.text || "";
  } catch (error) { throw error; }
};

export const generateResumeSummary = async (role: string, skills: string, experience: string): Promise<string> => {
  const prompt = `Resume summary for ${role}. Skills: ${skills}. Exp: ${experience}`;
  try {
    const ai = getAIClient();
    const response = await ai.models.generateContent({ model: 'gemini-3-flash-preview', contents: prompt });
    return response.text || "";
  } catch (error) { throw error; }
};

export const enhanceResumeDescription = async (text: string): Promise<string> => {
  const prompt = `Rewrite impactfully: "${text}"`;
  try {
    const ai = getAIClient();
    const response = await ai.models.generateContent({ model: 'gemini-3-flash-preview', contents: prompt });
    return response.text || text;
  } catch (error) { throw error; }
};

export const analyzeResumeImage = async (base64Image: string, mimeType: string) => {
  const prompt = `Extract resume data to JSON schema.`;
  try {
    const ai = getAIClient();
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: { parts: [{ inlineData: { mimeType, data: base64Image } }, { text: prompt }] },
      config: { responseMimeType: 'application/json' }
    });
    return JSON.parse(response.text || "{}");
  } catch (error) { throw error; }
};

export const generateProfessionalAvatar = async (base64Image: string, stylePrompt?: string): Promise<string> => {
  const finalPrompt = stylePrompt || "Professional corporate headshot.";
  try {
    const ai = getAIClient();
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts: [{ inlineData: { mimeType: 'image/jpeg', data: base64Image } }, { text: finalPrompt }] },
    });
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) return part.inlineData.data;
    }
    throw new Error("No image generated.");
  } catch (error) { throw error; }
};

export const createClaireChat = () => {
  const ai = getAIClient();
  return ai.chats.create({
    model: 'gemini-3-flash-preview',
    config: { systemInstruction: "You are Claire, a career coach helper." }
  });
};
