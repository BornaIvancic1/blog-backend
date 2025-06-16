import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI=new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

export const getGeminiResponse = async (userInput) => {
  const result = await model.generateContent(userInput);
  const response = await result.response;
  return response.text();
}; 