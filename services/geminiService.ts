import { GoogleGenAI, Type } from "@google/genai";

/**
 * Safely retrieves the API key from the environment.
 * Guidelines: Assume process.env.API_KEY is pre-configured.
 * We use a function to avoid top-level ReferenceErrors in strictly bundled ESM environments.
 */
const getSafeApiKey = (): string => {
  try {
    return process.env.API_KEY || "";
  } catch {
    return "";
  }
};

/**
 * Creates a fresh instance of the AI client.
 * Guidelines: Create a new instance right before use to ensure up-to-date keys.
 */
const getAIClient = () => {
  const apiKey = getSafeApiKey();
  if (!apiKey) {
    console.warn("Gemini API Key is missing from process.env.API_KEY");
  }
  return new GoogleGenAI({ apiKey });
};

export const generateCoverLetter = async (
  role: string,
  company: string,
  skills: string,
  jobDescription?: string
): Promise<string> => {
  const prompt = `
    Write a passionate and professional cover letter for the position of ${role} at ${company}.
    My Skills: ${skills}
    ${jobDescription ? `Job Description Key Points: ${jobDescription}` : ''}
    Keep it concise (under 300 words), engaging, and tailored to the company.
    Sign off with "Sincerely, [Applicant Name]".
  `;

  try {
    const ai = getAIClient();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text || "Could not generate cover letter.";
  } catch (error) {
    console.error("Error generating cover letter:", error);
    throw error;
  }
};

export const generateInterviewGuide = async (
  role: string,
  company: string,
  description?: string
): Promise<string> => {
  const prompt = `
    Act as a career coach. I have received an offer or an interview request for:
    Role: ${role}
    Company: ${company}
    ${description ? `Context: ${description}` : ''}

    Please provide a strategic guide including:
    1. 3 potential interview questions they might ask.
    2. 2 smart questions I should ask them.
    3. A brief negotiation tip.
    Format nicely in Markdown.
  `;

  try {
    const ai = getAIClient();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text || "Could not generate guide.";
  } catch (error) {
    console.error("Error generating interview guide:", error);
    throw error;
  }
};

export const generateResumeSummary = async (
  role: string,
  skills: string,
  experience: string
): Promise<string> => {
  const prompt = `
    Write a professional resume summary (approx 3-4 sentences) for a candidate with the following profile:
    Current/Target Role: ${role}
    Key Skills: ${skills}
    Key Experience Highlights: ${experience}
    Use strong action verbs and no first-person pronouns.
  `;

  try {
    const ai = getAIClient();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text || "Could not generate summary.";
  } catch (error) {
    console.error("Error generating resume summary:", error);
    throw error;
  }
};

export const enhanceResumeDescription = async (text: string): Promise<string> => {
  const prompt = `
    Rewrite the following resume experience description to be more professional, action-oriented, and impactful.
    Maintain the original meaning but use stronger verbs and clearer structure.
    
    Original Text:
    "${text}"
    
    Return ONLY the rewritten text, no conversational filler.
  `;

  try {
    const ai = getAIClient();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text || text;
  } catch (error) {
    console.error("Error enhancing description:", error);
    throw error;
  }
};

export const analyzeResumeImage = async (base64Image: string, mimeType: string) => {
  const prompt = `
    Analyze this resume image/document. Extract the structured data to match this JSON schema.
    Improve the wording of descriptions to be more action-oriented and professional where possible.
    
    If specific fields like email or phone are missing, use empty strings.
    For dates, try to format as YYYY-MM.
    
    Schema structure:
    {
      "fullName": string,
      "email": string,
      "phone": string,
      "location": string,
      "linkedin": string,
      "website": string,
      "summary": string,
      "skills": string (comma separated),
      "experience": [{ "role": string, "company": string, "location": string, "startDate": string, "endDate": string, "current": boolean, "description": string }],
      "education": [{ "degree": string, "school": string, "location": string, "startDate": string, "endDate": string }],
      "projects": [{ "name": string, "description": string, "techStack": string }]
    }
  `;

  try {
    const ai = getAIClient();
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview', // Complex reasoning for extraction
      contents: {
        parts: [
          { inlineData: { mimeType, data: base64Image } },
          { text: prompt }
        ]
      },
      config: {
        responseMimeType: 'application/json',
      }
    });

    const jsonText = response.text || "{}";
    return JSON.parse(jsonText);
  } catch (error) {
    console.error("Error analyzing resume:", error);
    throw error;
  }
};

export const generateProfessionalAvatar = async (base64Image: string, stylePrompt?: string): Promise<string> => {
  const finalPrompt = stylePrompt || "Transform this person into a high-quality professional corporate headshot. Studio lighting, neutral grey gradient background, professional business attire, sharp focus, confident smile.";

  try {
    const ai = getAIClient();
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          { inlineData: { mimeType: 'image/jpeg', data: base64Image } },
          { text: finalPrompt }
        ]
      },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return part.inlineData.data;
      }
    }
    throw new Error("No image generated.");
  } catch (error) {
    console.error("Error generating avatar:", error);
    throw error;
  }
};

export const createClaireChat = () => {
  const ai = getAIClient();
  return ai.chats.create({
    model: 'gemini-3-flash-preview',
    config: {
      systemInstruction: "You are Claire, a friendly, empathetic, and strategic career coach. You help the user optimize their job search. Keep answers concise and encouraging. Use formatting like bolding for key tips.",
    }
  });
};